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
  attacker_units_lost: number
  attacker_models_lost: number
  defender_units_lost: number
  defender_models_lost: number
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

export type BattleReportRoundStat = {
  id: number
  battle_report_id: string
  round_number: number
  attacker_points_earned: number
  attacker_units_lost: number
  attacker_models_lost: number
  defender_points_earned: number
  defender_units_lost: number
  defender_models_lost: number
  created_at: string
}

export type RoundStatFormValues = {
  round_number: number
  attacker_points_earned: string
  attacker_units_lost: string
  attacker_models_lost: string
  defender_points_earned: string
  defender_units_lost: string
  defender_models_lost: string
}

export type Mission = { id: number; edition_id: number; name: string }
export type Deployment = { id: number; name: string }
export type BattlePoints = { id: number; name: string; size: number }
