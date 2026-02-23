'use server'

import { getAuthUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { type ProfileFormState, validateBio, validateDisplayName, validateFactionIds } from '@/modules/profile/validation'

export async function updateProfile(prevState: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const auth = await getAuthUser({ withProfile: true })

  if (!auth) {
    return { error: 'You must be signed in to edit your profile.' }
  }

  const { profile } = auth

  const displayName = (formData.get('display_name') as string) ?? ''
  const bio = (formData.get('bio') as string) ?? ''

  const displayNameError = validateDisplayName(displayName)
  if (displayNameError) {
    return { errors: { display_name: displayNameError } }
  }

  const bioError = validateBio(bio)
  if (bioError) {
    return { errors: { bio: bioError } }
  }

  const factionIds = formData.getAll('faction_ids') as string[]
  const factionError = validateFactionIds(factionIds)
  if (factionError) {
    return { errors: { faction_ids: factionError } }
  }

  const avatarUrl = formData.get('avatar_url') as string | null

  const trimmed = displayName.trim()

  const supabase = await createClient()

  // Check uniqueness (case-insensitive), excluding the current user's own row
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .ilike('display_name', trimmed)
    .neq('id', profile.id)
    .single()

  if (existing) {
    return { errors: { display_name: 'Display name is already taken.' } }
  }

  const updateData: Record<string, string | null> = {
    display_name: trimmed,
    bio: bio.trim() || null,
  }

  if (avatarUrl) {
    updateData.avatar_url = avatarUrl
  }

  const { error } = await supabase.from('profiles').update(updateData).eq('id', profile.id)

  if (error) {
    if (error.code === '23505') {
      return { errors: { display_name: 'Display name is already taken.' } }
    }
    return { error: 'Failed to update profile. Please try again.' }
  }

  // Clear-and-replace faction associations
  await supabase.from('profile_factions').delete().eq('profile_id', profile.id)

  if (factionIds.length > 0) {
    const rows = factionIds.map((faction_id) => ({ profile_id: profile.id, faction_id }))
    const { error: factionInsertError } = await supabase.from('profile_factions').insert(rows)
    if (factionInsertError) {
      console.error('Failed to update faction associations:', factionInsertError)
    }
  }

  revalidatePath('/', 'layout')
  return { success: 'Profile updated successfully.' }
}
