'use server'

import { hasAnyRole } from '@/lib/supabase/roles'
import { createClient } from '@/lib/supabase/server'
import type { FormState } from '@/types/forms'
import { revalidatePath } from 'next/cache'

export type ForceDispositionFormState = FormState<{
  name: string
  description: string
}>

export async function createForceDisposition(
  prevState: ForceDispositionFormState,
  formData: FormData
): Promise<ForceDispositionFormState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  const canManage = await hasAnyRole(user.id, ['admin', 'organizer'])
  if (!canManage) {
    return { error: 'Only admins and organizers can create force dispositions.' }
  }

  const editionId = Number(formData.get('edition_id'))
  const name = (formData.get('name') as string)?.trim() ?? ''
  const description = (formData.get('description') as string)?.trim() ?? ''

  if (!editionId) return { error: 'Invalid edition.' }

  const errors: Record<string, string> = {}
  if (!name) errors.name = 'Name is required.'

  if (Object.keys(errors).length > 0) return { errors }

  const { error } = await supabase
    .from('force_dispositions')
    .insert({ edition_id: editionId, name, description: description || null })

  if (error) {
    if (error.code === '23505') {
      return { errors: { name: 'A force disposition with this name already exists in this edition.' } }
    }
    console.error('Failed to create force disposition:', error)
    return { error: 'Failed to create force disposition. Please try again.' }
  }

  revalidatePath('/', 'layout')
  return { success: 'Force disposition created.' }
}

export async function updateForceDisposition(
  prevState: ForceDispositionFormState,
  formData: FormData
): Promise<ForceDispositionFormState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  const canManage = await hasAnyRole(user.id, ['admin', 'organizer'])
  if (!canManage) {
    return { error: 'Only admins and organizers can update force dispositions.' }
  }

  const forceDispositionId = Number(formData.get('force_disposition_id'))
  const name = (formData.get('name') as string)?.trim() ?? ''
  const description = (formData.get('description') as string)?.trim() ?? ''

  if (!forceDispositionId) return { error: 'Invalid force disposition.' }

  const errors: Record<string, string> = {}
  if (!name) errors.name = 'Name is required.'

  if (Object.keys(errors).length > 0) return { errors }

  const { error } = await supabase
    .from('force_dispositions')
    .update({ name, description: description || null })
    .eq('id', forceDispositionId)

  if (error) {
    if (error.code === '23505') {
      return { errors: { name: 'A force disposition with this name already exists in this edition.' } }
    }
    console.error('Failed to update force disposition:', error)
    return { error: 'Failed to update force disposition. Please try again.' }
  }

  revalidatePath('/', 'layout')
  return { success: 'Force disposition updated.' }
}

export async function deleteForceDisposition(forceDispositionId: number): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  const canManage = await hasAnyRole(user.id, ['admin', 'organizer'])
  if (!canManage) {
    return { error: 'Only admins and organizers can delete force dispositions.' }
  }

  const { count: missionCount, error: missionCountError } = await supabase
    .from('missions')
    .select('id', { count: 'exact', head: true })
    .or(`force_disposition_id.eq.${forceDispositionId},opponent_force_disposition_id.eq.${forceDispositionId}`)

  if (missionCountError) {
    console.error('Failed to check mission references:', missionCountError)
    return { error: 'Failed to verify force disposition usage. Please try again.' }
  }

  if ((missionCount ?? 0) > 0) {
    return {
      error: `Cannot delete this force disposition: ${missionCount} mission${missionCount === 1 ? ' is' : 's are'} mapped to it. Remove those mappings first.`,
    }
  }

  const { count: reportCount, error: reportCountError } = await supabase
    .from('battle_reports')
    .select('id', { count: 'exact', head: true })
    .or(
      `attacker_force_disposition_id.eq.${forceDispositionId},defender_force_disposition_id.eq.${forceDispositionId}`
    )

  if (reportCountError) {
    console.error('Failed to check battle report references:', reportCountError)
    return { error: 'Failed to verify force disposition usage. Please try again.' }
  }

  if ((reportCount ?? 0) > 0) {
    return {
      error: `Cannot delete this force disposition: ${reportCount} battle report${reportCount === 1 ? '' : 's'} reference${reportCount === 1 ? 's' : ''} it. Edit those reports first.`,
    }
  }

  const { error } = await supabase.from('force_dispositions').delete().eq('id', forceDispositionId)

  if (error) {
    console.error('Failed to delete force disposition:', error)
    return { error: 'Failed to delete force disposition. Please try again.' }
  }

  revalidatePath('/', 'layout')
  return {}
}
