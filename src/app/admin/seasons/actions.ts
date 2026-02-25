'use server'

import { createClient } from '@/lib/supabase/server'
import { hasRole } from '@/lib/supabase/roles'
import { getNextSeasonNumber } from '@/modules/season/queries'
import { revalidatePath } from 'next/cache'
import type { FormState } from '@/types/forms'

export type SeasonFormState = FormState<{
  name: string
  start_date: string
  end_date: string
  battle_points_id: string
  description: string
  rules: string
}>

export async function createSeason(prevState: SeasonFormState, formData: FormData): Promise<SeasonFormState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  const isAdmin = await hasRole(user.id, 'admin')
  if (!isAdmin) {
    return { error: 'Only admins can create seasons.' }
  }

  const name = (formData.get('name') as string)?.trim() ?? ''
  const startDate = (formData.get('start_date') as string) ?? ''
  const endDate = (formData.get('end_date') as string) ?? ''
  const battlePointsId = (formData.get('battle_points_id') as string) ?? ''
  const description = (formData.get('description') as string)?.trim() ?? ''
  const rules = (formData.get('rules') as string)?.trim() ?? ''
  const isActive = formData.get('is_active') === 'on'
  const backfill = formData.get('backfill') === 'on'

  const errors: Record<string, string> = {}

  if (!startDate) errors.start_date = 'Start date is required.'
  if (!endDate) errors.end_date = 'End date is required.'
  if (!battlePointsId) errors.battle_points_id = 'Battle size is required.'
  if (startDate && endDate && endDate <= startDate) errors.end_date = 'End date must be after start date.'

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  const nextNumber = await getNextSeasonNumber()

  // If activating this season, deactivate any currently active season first
  if (isActive) {
    await supabase.from('seasons').update({ is_active: false }).eq('is_active', true)
  }

  const { data: newSeason, error } = await supabase
    .from('seasons')
    .insert({
      number: nextNumber,
      name: name || null,
      start_date: startDate,
      end_date: endDate,
      battle_points_id: Number(battlePointsId),
      description: description || null,
      rules: rules || null,
      is_active: isActive,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to create season:', error)
    return { error: 'Failed to create season. Please try again.' }
  }

  // Optionally backfill existing battle reports
  if (backfill && newSeason) {
    const { error: backfillError } = await supabase
      .from('battle_reports')
      .update({ season_id: newSeason.id })
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .is('season_id', null)

    if (backfillError) {
      console.error('Failed to backfill battle reports:', backfillError)
      // Non-fatal — season was still created
    }
  }

  revalidatePath('/', 'layout')
  return { success: 'Season created successfully.' }
}

export async function updateSeason(prevState: SeasonFormState, formData: FormData): Promise<SeasonFormState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  const isAdmin = await hasRole(user.id, 'admin')
  if (!isAdmin) {
    return { error: 'Only admins can update seasons.' }
  }

  const seasonId = Number(formData.get('season_id'))
  const name = (formData.get('name') as string)?.trim() ?? ''
  const startDate = (formData.get('start_date') as string) ?? ''
  const endDate = (formData.get('end_date') as string) ?? ''
  const battlePointsId = (formData.get('battle_points_id') as string) ?? ''
  const description = (formData.get('description') as string)?.trim() ?? ''
  const rules = (formData.get('rules') as string)?.trim() ?? ''
  const isActive = formData.get('is_active') === 'on'

  if (!seasonId) {
    return { error: 'Invalid season.' }
  }

  const errors: Record<string, string> = {}

  if (!startDate) errors.start_date = 'Start date is required.'
  if (!endDate) errors.end_date = 'End date is required.'
  if (!battlePointsId) errors.battle_points_id = 'Battle size is required.'
  if (startDate && endDate && endDate <= startDate) errors.end_date = 'End date must be after start date.'

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  // If activating this season, deactivate any other currently active season first
  if (isActive) {
    await supabase.from('seasons').update({ is_active: false }).eq('is_active', true).neq('id', seasonId)
  }

  const { error } = await supabase
    .from('seasons')
    .update({
      name: name || null,
      start_date: startDate,
      end_date: endDate,
      battle_points_id: Number(battlePointsId),
      description: description || null,
      rules: rules || null,
      is_active: isActive,
    })
    .eq('id', seasonId)

  if (error) {
    console.error('Failed to update season:', error)
    return { error: 'Failed to update season. Please try again.' }
  }

  revalidatePath('/', 'layout')
  return { success: 'Season updated successfully.' }
}
