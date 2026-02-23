import type { BattlePoints, BattleReport, Deployment, Mission } from '@/types/battle-report'
import type { ProfileFaction } from '@/types/faction'
import type { Profile } from '@/types/profile'
import { createClient } from '@/lib/supabase/server'

export async function getMissions(): Promise<Mission[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('missions').select('*').order('name')

  if (error) {
    console.error('Failed to fetch missions:', error)
    return []
  }

  return data as Mission[]
}

export async function getDeployments(): Promise<Deployment[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('deployments').select('*').order('name')

  if (error) {
    console.error('Failed to fetch deployments:', error)
    return []
  }

  return data as Deployment[]
}

export async function getBattlePoints(): Promise<BattlePoints[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('battle_points').select('*').order('size')

  if (error) {
    console.error('Failed to fetch battle points:', error)
    return []
  }

  return data as BattlePoints[]
}

export async function getBattleReports(): Promise<BattleReport[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('battle_reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch battle reports:', error)
    return []
  }

  return data as BattleReport[]
}

export async function getBattleReportsByPlayerId(playerId: string): Promise<BattleReport[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('battle_reports')
    .select('*')
    .or(`attacker_id.eq.${playerId},defender_id.eq.${playerId}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch battle reports for player:', error)
    return []
  }

  return data as BattleReport[]
}

export async function getBattleReportsBySeasonId(seasonId: number): Promise<BattleReport[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('battle_reports')
    .select('*')
    .eq('season_id', seasonId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch battle reports for season:', error)
    return []
  }

  return data as BattleReport[]
}

export async function getBattleReportCountsBySeasonId(): Promise<Map<number, number>> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('battle_reports').select('season_id')

  if (error) {
    console.error('Failed to fetch battle report counts:', error)
    return new Map()
  }

  const counts = new Map<number, number>()
  for (const row of data) {
    if (row.season_id != null) {
      counts.set(row.season_id, (counts.get(row.season_id) ?? 0) + 1)
    }
  }
  return counts
}

export async function getBattleReportById(id: string): Promise<BattleReport | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('battle_reports')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Failed to fetch battle report:', error)
    return null
  }

  return data as BattleReport
}

export async function getMembers(): Promise<Profile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['member', 'organizer'])
    .order('display_name')

  if (error) {
    console.error('Failed to fetch members:', error)
    return []
  }

  return data as Profile[]
}

export async function getMemberFactions(): Promise<ProfileFaction[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('profile_factions').select('profile_id, faction_id')

  if (error) {
    console.error('Failed to fetch member factions:', error)
    return []
  }

  return data as ProfileFaction[]
}
