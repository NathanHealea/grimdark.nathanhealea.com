export type Outcome = 'win' | 'loss' | 'draw'

export type BattleReportStatus = 'draft' | 'published'

export type BattleReport = {
  id: string
  status: BattleReportStatus
  attacker_id: string | null
  attacker_faction_id: string | null
  attacker_score: number | null
  attacker_outcome: Outcome | null
  defender_id: string | null
  defender_faction_id: string | null
  defender_score: number | null
  defender_outcome: Outcome | null
  attacker_tabled: boolean
  defender_tabled: boolean
  mission_id: number | null
  deployment_id: number | null
  battle_points_id: number | null
  rounds: number | null
  event_date: string | null
  season_id: number | null
  reported_by: string
  created_at: string
  updated_at: string
}

export type Mission = { id: number; name: string }
export type Deployment = { id: number; name: string }
export type BattlePoints = { id: number; name: string; size: number }
