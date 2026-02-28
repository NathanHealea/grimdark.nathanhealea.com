'use server'

import { createClient } from '@/lib/supabase/server'
import { hasAnyRole } from '@/lib/supabase/roles'
import { revalidatePath } from 'next/cache'

export async function addParticipant(seasonId: number, profileId: string, factionId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in.' }

  const canManage = await hasAnyRole(user.id, ['admin', 'organizer'])
  if (!canManage) return { error: 'Only admins and organizers can manage rosters.' }

  const { error } = await supabase
    .from('season_roster')
    .upsert(
      { season_id: seasonId, profile_id: profileId, faction_id: factionId },
      { onConflict: 'season_id,profile_id' },
    )

  if (error) {
    console.error('Failed to add participant:', error)
    return { error: 'Failed to add participant.' }
  }

  revalidatePath('/', 'layout')
  return {}
}

export async function removeParticipant(seasonId: number, profileId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in.' }

  const canManage = await hasAnyRole(user.id, ['admin', 'organizer'])
  if (!canManage) return { error: 'Only admins and organizers can manage rosters.' }

  const { error } = await supabase
    .from('season_roster')
    .delete()
    .eq('season_id', seasonId)
    .eq('profile_id', profileId)

  if (error) {
    console.error('Failed to remove participant:', error)
    return { error: 'Failed to remove participant.' }
  }

  revalidatePath('/', 'layout')
  return {}
}

export async function updateParticipantFaction(seasonId: number, profileId: string, factionId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in.' }

  const canManage = await hasAnyRole(user.id, ['admin', 'organizer'])
  if (!canManage) return { error: 'Only admins and organizers can manage rosters.' }

  const { error } = await supabase
    .from('season_roster')
    .update({ faction_id: factionId })
    .eq('season_id', seasonId)
    .eq('profile_id', profileId)

  if (error) {
    console.error('Failed to update participant faction:', error)
    return { error: 'Failed to update faction.' }
  }

  revalidatePath('/', 'layout')
  return {}
}
