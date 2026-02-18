'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type SetupProfileState = { error?: string } | null

export async function setupProfile(prevState: SetupProfileState, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to create a profile.' }
  }

  const displayName = formData.get('display_name') as string

  if (!displayName?.trim()) {
    return { error: 'Display name is required.' }
  }

  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    display_name: displayName.trim(),
  })

  if (error) {
    if (error.code === '23505') {
      redirect('/')
    }
    return { error: 'Failed to create profile. Please try again.' }
  }

  redirect('/')
}
