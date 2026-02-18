'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { type ProfileFormState, validateDisplayName } from './validation'

export async function setupProfile(prevState: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to create a profile.' }
  }

  const displayName = (formData.get('display_name') as string) ?? ''
  const fieldError = validateDisplayName(displayName)

  if (fieldError) {
    return { errors: { display_name: fieldError } }
  }

  const trimmed = displayName.trim()

  // Check uniqueness (case-insensitive)
  const { data: existing } = await supabase.from('profiles').select('id').ilike('display_name', trimmed).single()

  if (existing) {
    return { errors: { display_name: 'Display name is already taken.' } }
  }

  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    display_name: trimmed,
  })

  if (error) {
    if (error.code === '23505') {
      return { errors: { display_name: 'Display name is already taken.' } }
    }
    return { error: 'Failed to create profile. Please try again.' }
  }

  redirect('/')
}
