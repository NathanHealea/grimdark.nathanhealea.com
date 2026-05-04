import type { Season, SeasonRosterEntry } from '@/types/season'
import type { Profile } from '@/types/profile'
import type { Faction } from '@/types/faction'
import { createClient } from '@/lib/supabase/server'

export async function getSeasons({ includeAll = false } = {}): Promise<Season[]> {
  const supabase = await createClient()

  let query = supabase.from('seasons').select('*')

  if (!includeAll) query = query.eq('status', 'published')

  const { data, error } = await query.order('start_date', { ascending: false })

  if (error) {
    console.error('Failed to fetch seasons:', error)
    return []
  }

  return data as Season[]
}

export async function getCurrentSeason(): Promise<Season | null> {
  const supabase = await createClient()
  const d = new Date()
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('status', 'published')
    .lte('start_date', today)
    .gte('end_date', today)
    .order('start_date', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // no rows
    console.error('Failed to fetch current season:', error)
    return null
  }

  return data as Season
}

export async function getSeasonById(id: number): Promise<Season | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('seasons').select('*').eq('id', id).single()

  if (error) {
    console.error('Failed to fetch season:', error)
    return null
  }

  return data as Season
}

export async function getNextSeasonNumber(): Promise<number> {
  const supabase = await createClient()

  const { data } = await supabase.from('seasons').select('number').order('number', { ascending: false }).limit(1)

  return (data?.[0]?.number ?? 0) + 1
}

export type RosterEntryWithDetails = SeasonRosterEntry & {
  profiles: Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'profile_id'>
  factions: Pick<Faction, 'id' | 'name'>
}

export async function getSeasonRoster(seasonId: number): Promise<RosterEntryWithDetails[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('season_roster')
    .select('season_id, profile_id, faction_id, joined_at, profiles(id, display_name, avatar_url, profile_id), factions(id, name)')
    .eq('season_id', seasonId)
    .order('joined_at')

  if (error) {
    console.error('Failed to fetch season roster:', error)
    return []
  }

  return (data ?? []) as unknown as RosterEntryWithDetails[]
}

export async function getSeasonRosterCounts(): Promise<Map<number, number>> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('season_roster').select('season_id')

  if (error) {
    console.error('Failed to fetch roster counts:', error)
    return new Map()
  }

  const counts = new Map<number, number>()
  for (const row of data ?? []) {
    counts.set(row.season_id, (counts.get(row.season_id) ?? 0) + 1)
  }
  return counts
}
