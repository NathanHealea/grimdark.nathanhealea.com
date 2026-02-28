import type { Faction } from '@/types/faction'
import { createClient } from '@/lib/supabase/server'

export async function getFactions(): Promise<Faction[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('factions').select('*').order('name')

  if (error) {
    console.error('Failed to fetch factions:', error)
    return []
  }

  return data as Faction[]
}

export async function getProfileFactionIds(profileId: string): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profile_factions')
    .select('faction_id')
    .eq('profile_id', profileId)

  if (error) {
    console.error('Failed to fetch profile factions:', error)
    return []
  }

  return data.map((row) => row.faction_id)
}

export async function getAllProfileFactionEntries(): Promise<{ profile_id: string; faction_id: string }[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('profile_factions').select('profile_id, faction_id')

  if (error) {
    console.error('Failed to fetch all profile factions:', error)
    return []
  }

  return data
}
