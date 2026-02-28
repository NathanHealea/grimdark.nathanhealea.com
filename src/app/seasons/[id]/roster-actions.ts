'use server'

import { getAuthUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function joinSeason(seasonId: number, factionId: string) {
  const auth = await getAuthUser({ withProfile: true })
  if (!auth) return { error: 'You must be signed in.' }

  const supabase = await createClient()

  const { error } = await supabase.from('season_roster').insert({
    season_id: seasonId,
    profile_id: auth.profile.id,
    faction_id: factionId,
  })

  if (error) {
    if (error.code === '23505') return { error: 'You are already on this roster.' }
    console.error('Failed to join season:', error)
    return { error: 'Failed to join season.' }
  }

  revalidatePath('/', 'layout')
  return {}
}

export async function leaveSeason(seasonId: number) {
  const auth = await getAuthUser({ withProfile: true })
  if (!auth) return { error: 'You must be signed in.' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('season_roster')
    .delete()
    .eq('season_id', seasonId)
    .eq('profile_id', auth.profile.id)

  if (error) {
    console.error('Failed to leave season:', error)
    return { error: 'Failed to leave season.' }
  }

  revalidatePath('/', 'layout')
  return {}
}

export async function updateRosterFaction(seasonId: number, factionId: string) {
  const auth = await getAuthUser({ withProfile: true })
  if (!auth) return { error: 'You must be signed in.' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('season_roster')
    .update({ faction_id: factionId })
    .eq('season_id', seasonId)
    .eq('profile_id', auth.profile.id)

  if (error) {
    console.error('Failed to update roster faction:', error)
    return { error: 'Failed to update faction.' }
  }

  revalidatePath('/', 'layout')
  return {}
}
