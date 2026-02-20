'use server'

import { createClient } from '@/lib/supabase/server'
import { hasRole } from '@/lib/supabase/roles'
import { type ProfileFormState, validateBio, validateDisplayName, validateFactionIds } from '@/modules/profile/validation'
import { revalidatePath } from 'next/cache'

export async function adminUpdateProfile(prevState: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  const isAdmin = await hasRole(user.id, 'admin')
  if (!isAdmin) {
    return { error: 'You do not have permission to edit profiles.' }
  }

  const targetUserId = formData.get('target_user_id') as string
  if (!targetUserId) {
    return { error: 'Missing target user.' }
  }

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

  // Check uniqueness (case-insensitive), excluding the target user's own row
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .ilike('display_name', trimmed)
    .neq('id', targetUserId)
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

  const { error } = await supabase.from('profiles').update(updateData).eq('id', targetUserId)

  if (error) {
    if (error.code === '23505') {
      return { errors: { display_name: 'Display name is already taken.' } }
    }
    return { error: 'Failed to update profile. Please try again.' }
  }

  // Clear-and-replace faction associations
  await supabase.from('profile_factions').delete().eq('profile_id', targetUserId)

  if (factionIds.length > 0) {
    const rows = factionIds.map((faction_id) => ({ profile_id: targetUserId, faction_id }))
    const { error: factionInsertError } = await supabase.from('profile_factions').insert(rows)
    if (factionInsertError) {
      console.error('Failed to update faction associations:', factionInsertError)
    }
  }

  revalidatePath('/', 'layout')
  return { success: 'Profile updated successfully.' }
}
