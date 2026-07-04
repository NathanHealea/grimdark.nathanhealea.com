'use server'

import { hasAnyRole } from '@/lib/supabase/roles'
import { createClient } from '@/lib/supabase/server'
import type { FormState } from '@/types/forms'
import { revalidatePath } from 'next/cache'

export type MissionFormState = FormState<{
  name: string
  force_disposition_id: string
  opponent_force_disposition_id: string
}>

function parseDispositionMapping(formData: FormData): {
  errors?: Record<string, string>
  forceDispositionId: number | null
  opponentForceDispositionId: number | null
} {
  const rawDeck = (formData.get('force_disposition_id') as string) ?? ''
  const rawOpponent = (formData.get('opponent_force_disposition_id') as string) ?? ''

  if (!rawDeck !== !rawOpponent) {
    const message = 'Set both the disposition deck and opponent disposition, or neither.'
    return {
      errors: rawDeck
        ? { opponent_force_disposition_id: message }
        : { force_disposition_id: message },
      forceDispositionId: null,
      opponentForceDispositionId: null,
    }
  }

  return {
    forceDispositionId: rawDeck ? Number(rawDeck) : null,
    opponentForceDispositionId: rawOpponent ? Number(rawOpponent) : null,
  }
}

function isPairingViolation(error: { code?: string; message?: string }): boolean {
  return error.code === '23505' && (error.message ?? '').includes('missions_disposition_pairing_unique')
}

export async function createMission(prevState: MissionFormState, formData: FormData): Promise<MissionFormState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  const canManage = await hasAnyRole(user.id, ['admin', 'organizer'])
  if (!canManage) {
    return { error: 'Only admins and organizers can create missions.' }
  }

  const editionId = Number(formData.get('edition_id'))
  const name = (formData.get('name') as string)?.trim() ?? ''

  if (!editionId) return { error: 'Invalid edition.' }

  const errors: Record<string, string> = {}
  if (!name) errors.name = 'Name is required.'

  const mapping = parseDispositionMapping(formData)
  if (mapping.errors) Object.assign(errors, mapping.errors)

  if (Object.keys(errors).length > 0) return { errors }

  const { error } = await supabase.from('missions').insert({
    edition_id: editionId,
    name,
    force_disposition_id: mapping.forceDispositionId,
    opponent_force_disposition_id: mapping.opponentForceDispositionId,
  })

  if (error) {
    if (isPairingViolation(error)) {
      return {
        errors: { opponent_force_disposition_id: 'This deck already has a mission against that opponent disposition.' },
      }
    }
    if (error.code === '23505') {
      return { errors: { name: 'A mission with this name already exists in this edition.' } }
    }
    console.error('Failed to create mission:', error)
    return { error: 'Failed to create mission. Please try again.' }
  }

  revalidatePath('/', 'layout')
  return { success: 'Mission created.' }
}

export async function updateMission(prevState: MissionFormState, formData: FormData): Promise<MissionFormState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  const canManage = await hasAnyRole(user.id, ['admin', 'organizer'])
  if (!canManage) {
    return { error: 'Only admins and organizers can update missions.' }
  }

  const missionId = Number(formData.get('mission_id'))
  const name = (formData.get('name') as string)?.trim() ?? ''

  if (!missionId) return { error: 'Invalid mission.' }

  const errors: Record<string, string> = {}
  if (!name) errors.name = 'Name is required.'

  const mapping = parseDispositionMapping(formData)
  if (mapping.errors) Object.assign(errors, mapping.errors)

  if (Object.keys(errors).length > 0) return { errors }

  const { error } = await supabase
    .from('missions')
    .update({
      name,
      force_disposition_id: mapping.forceDispositionId,
      opponent_force_disposition_id: mapping.opponentForceDispositionId,
    })
    .eq('id', missionId)

  if (error) {
    if (isPairingViolation(error)) {
      return {
        errors: { opponent_force_disposition_id: 'This deck already has a mission against that opponent disposition.' },
      }
    }
    if (error.code === '23505') {
      return { errors: { name: 'A mission with this name already exists in this edition.' } }
    }
    console.error('Failed to update mission:', error)
    return { error: 'Failed to update mission. Please try again.' }
  }

  revalidatePath('/', 'layout')
  return { success: 'Mission updated.' }
}

export async function deleteMission(missionId: number): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  const canManage = await hasAnyRole(user.id, ['admin', 'organizer'])
  if (!canManage) {
    return { error: 'Only admins and organizers can delete missions.' }
  }

  const { count, error: countError } = await supabase
    .from('battle_reports')
    .select('id', { count: 'exact', head: true })
    .eq('mission_id', missionId)

  if (countError) {
    console.error('Failed to check battle report references:', countError)
    return { error: 'Failed to verify mission usage. Please try again.' }
  }

  if ((count ?? 0) > 0) {
    return {
      error: `Cannot delete this mission: ${count} battle report${count === 1 ? '' : 's'} reference${count === 1 ? 's' : ''} it. Edit those reports to a different mission first.`,
    }
  }

  const { error } = await supabase.from('missions').delete().eq('id', missionId)

  if (error) {
    console.error('Failed to delete mission:', error)
    return { error: 'Failed to delete mission. Please try again.' }
  }

  revalidatePath('/', 'layout')
  return {}
}
