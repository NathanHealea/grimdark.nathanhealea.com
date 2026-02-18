'use server'

import { createClient } from '@/lib/supabase/server'
import { type ProfileFormState, validateBio, validateDisplayName } from '@/modules/profile/validation'

export async function updateProfile(prevState: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to edit your profile.' }
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

  const trimmed = displayName.trim()

  // Check uniqueness (case-insensitive), excluding the current user's own row
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .ilike('display_name', trimmed)
    .neq('id', user.id)
    .single()

  if (existing) {
    return { errors: { display_name: 'Display name is already taken.' } }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: trimmed,
      bio: bio.trim() || null,
    })
    .eq('id', user.id)

  if (error) {
    if (error.code === '23505') {
      return { errors: { display_name: 'Display name is already taken.' } }
    }
    return { error: 'Failed to update profile. Please try again.' }
  }

  return { success: 'Profile updated successfully.' }
}
