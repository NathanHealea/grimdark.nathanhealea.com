export type Season = {
  id: number
  number: number
  name: string | null
  start_date: string
  end_date: string
  battle_points_id: number
  description: string | null
  rules: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export function formatSeasonName(season: Pick<Season, 'number' | 'name'>): string {
  return season.name ? `Season ${season.number} - ${season.name}` : `Season ${season.number}`
}
