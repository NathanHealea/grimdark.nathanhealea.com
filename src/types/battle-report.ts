export type Outcome = 'win' | 'loss' | 'draw'

export type BattleReport = {
  id: string
  attacker_id: string
  attacker_faction_id: string
  attacker_score: number
  attacker_outcome: Outcome
  defender_id: string
  defender_faction_id: string
  defender_score: number
  defender_outcome: Outcome
  mission_id: number
  deployment_id: number
  battle_points_id: number
  rounds: number
  event_date: string
  reported_by: string
  created_at: string
  updated_at: string
}

export type Mission = { id: number; name: string }
export type Deployment = { id: number; name: string }
export type BattlePoints = { id: number; name: string; size: number }
