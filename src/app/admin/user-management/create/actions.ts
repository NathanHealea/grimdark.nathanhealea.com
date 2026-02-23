'use server'

import { createClient } from '@/lib/supabase/server'
import { hasRole } from '@/lib/supabase/roles'
import { type ProfileFormState, validateDisplayName, validateFactionIds } from '@/modules/profile/validation'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createUnlinkedProfile(
  prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  const isAdmin = await hasRole(user.id, 'admin')
  if (!isAdmin) {
    return { error: 'You do not have permission to create profiles.' }
  }

  const displayName = (formData.get('display_name') as string) ?? ''
  const bio = (formData.get('bio') as string) ?? ''
  const linkId = (formData.get('link_id') as string)?.trim() || null
  const role = (formData.get('role') as string) || 'member'

  const displayNameError = validateDisplayName(displayName)
  if (displayNameError) {
    return { errors: { display_name: displayNameError } }
  }

  const factionIds = formData.getAll('faction_ids') as string[]
  const factionError = validateFactionIds(factionIds)
  if (factionError) {
    return { errors: { faction_ids: factionError } }
  }

  const trimmed = displayName.trim()

  // Check uniqueness (case-insensitive)
  const { data: existing } = await supabase.from('profiles').select('id').ilike('display_name', trimmed).single()

  if (existing) {
    return { errors: { display_name: 'Display name is already taken.' } }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .insert({
      display_name: trimmed,
      bio: bio.trim() || null,
      link_id: linkId,
      role,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { errors: { display_name: 'Display name is already taken.' } }
    }
    return { error: 'Failed to create profile. Please try again.' }
  }

  // Insert faction associations
  if (factionIds.length > 0) {
    const rows = factionIds.map((faction_id) => ({ profile_id: profile.id, faction_id }))
    const { error: factionInsertError } = await supabase.from('profile_factions').insert(rows)
    if (factionInsertError) {
      console.error('Failed to insert faction associations:', factionInsertError)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/admin/user-management')
}
