'use server'

import { createClient } from '@/lib/supabase/server'
import { hasRole } from '@/lib/supabase/roles'
import { getNextSeasonNumber } from '@/modules/season/queries'
import { revalidatePath } from 'next/cache'
import type { FormState } from '@/types/forms'

export type SeasonFormState = FormState<{
  name: string
  status: string
  start_date: string
  end_date: string
  battle_points_id: string
  description: string
  rules: string
}>

async function checkOverlap(
  supabase: Awaited<ReturnType<typeof createClient>>,
  startDate: string,
  endDate: string,
  status: string,
  excludeId?: number
): Promise<string | null> {
  if (status !== 'published') return null

  let query = supabase
    .from('seasons')
    .select('id, number, name')
    .eq('status', 'published')
    .lte('start_date', endDate)
    .gte('end_date', startDate)

  if (excludeId) query = query.neq('id', excludeId)

  const { data } = await query

  if (data && data.length > 0) {
    const names = data.map((s) => s.name ? `Season ${s.number} - ${s.name}` : `Season ${s.number}`)
    return `Date range overlaps with published season: ${names.join(', ')}. Change dates or unpublish the other season first.`
  }

  return null
}

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
  const status = (formData.get('status') as string) ?? 'draft'
  const startDate = (formData.get('start_date') as string) ?? ''
  const endDate = (formData.get('end_date') as string) ?? ''
  const battlePointsId = (formData.get('battle_points_id') as string) ?? ''
  const description = (formData.get('description') as string)?.trim() ?? ''
  const rules = (formData.get('rules') as string)?.trim() ?? ''
  const backfill = formData.get('backfill') === 'on'

  const errors: Record<string, string> = {}

  if (!status || !['draft', 'published'].includes(status)) errors.status = 'Status must be draft or published.'
  if (!startDate) errors.start_date = 'Start date is required.'
  if (!endDate) errors.end_date = 'End date is required.'
  if (!battlePointsId) errors.battle_points_id = 'Battle size is required.'
  if (startDate && endDate && endDate <= startDate) errors.end_date = 'End date must be after start date.'

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  // Check for overlapping published seasons
  const overlapError = await checkOverlap(supabase, startDate, endDate, status)
  if (overlapError) {
    return { errors: { start_date: overlapError } }
  }

  const nextNumber = await getNextSeasonNumber()

  const { data: newSeason, error } = await supabase
    .from('seasons')
    .insert({
      number: nextNumber,
      name: name || null,
      status,
      start_date: startDate,
      end_date: endDate,
      battle_points_id: Number(battlePointsId),
      description: description || null,
      rules: rules || null,
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
  const status = (formData.get('status') as string) ?? 'draft'
  const startDate = (formData.get('start_date') as string) ?? ''
  const endDate = (formData.get('end_date') as string) ?? ''
  const battlePointsId = (formData.get('battle_points_id') as string) ?? ''
  const description = (formData.get('description') as string)?.trim() ?? ''
  const rules = (formData.get('rules') as string)?.trim() ?? ''

  if (!seasonId) {
    return { error: 'Invalid season.' }
  }

  const errors: Record<string, string> = {}

  if (!status || !['draft', 'published'].includes(status)) errors.status = 'Status must be draft or published.'
  if (!startDate) errors.start_date = 'Start date is required.'
  if (!endDate) errors.end_date = 'End date is required.'
  if (!battlePointsId) errors.battle_points_id = 'Battle size is required.'
  if (startDate && endDate && endDate <= startDate) errors.end_date = 'End date must be after start date.'

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  // Check for overlapping published seasons
  const overlapError = await checkOverlap(supabase, startDate, endDate, status, seasonId)
  if (overlapError) {
    return { errors: { start_date: overlapError } }
  }

  const { error } = await supabase
    .from('seasons')
    .update({
      name: name || null,
      status,
      start_date: startDate,
      end_date: endDate,
      battle_points_id: Number(battlePointsId),
      description: description || null,
      rules: rules || null,
    })
    .eq('id', seasonId)

  if (error) {
    console.error('Failed to update season:', error)
    return { error: 'Failed to update season. Please try again.' }
  }

  revalidatePath('/', 'layout')
  return { success: 'Season updated successfully.' }
}
