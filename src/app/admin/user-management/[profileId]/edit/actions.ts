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

  const targetProfileId = formData.get('target_profile_id') as string
  if (!targetProfileId) {
    return { error: 'Missing target profile.' }
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
  const linkId = (formData.get('link_id') as string)?.trim() || null
  const role = formData.get('role') as string

  const trimmed = displayName.trim()

  // Check uniqueness (case-insensitive), excluding the target profile's own row
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .ilike('display_name', trimmed)
    .neq('id', targetProfileId)
    .single()

  if (existing) {
    return { errors: { display_name: 'Display name is already taken.' } }
  }

  const updateData: Record<string, string | null> = {
    display_name: trimmed,
    bio: bio.trim() || null,
    link_id: linkId,
    role: role || 'member',
  }

  if (avatarUrl) {
    updateData.avatar_url = avatarUrl
  }

  const { error } = await supabase.from('profiles').update(updateData).eq('id', targetProfileId)

  if (error) {
    if (error.code === '23505') {
      return { errors: { display_name: 'Display name is already taken.' } }
    }
    return { error: 'Failed to update profile. Please try again.' }
  }

  // Clear-and-replace faction associations
  await supabase.from('profile_factions').delete().eq('profile_id', targetProfileId)

  if (factionIds.length > 0) {
    const rows = factionIds.map((faction_id) => ({ profile_id: targetProfileId, faction_id }))
    const { error: factionInsertError } = await supabase.from('profile_factions').insert(rows)
    if (factionInsertError) {
      console.error('Failed to update faction associations:', factionInsertError)
    }
  }

  revalidatePath('/', 'layout')
  return { success: 'Profile updated successfully.' }
}

export async function unlinkProfileAction(prevState: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  const isAdmin = await hasRole(user.id, 'admin')
  if (!isAdmin) {
    return { error: 'You do not have permission to unlink profiles.' }
  }

  const profileId = formData.get('profile_id') as string
  if (!profileId) {
    return { error: 'Missing profile ID.' }
  }

  const { error } = await supabase.rpc('unlink_profile', { profile_uuid: profileId })

  if (error) {
    return { error: `Failed to unlink profile: ${error.message}` }
  }

  revalidatePath('/', 'layout')
  return { success: 'Profile unlinked successfully.' }
}
