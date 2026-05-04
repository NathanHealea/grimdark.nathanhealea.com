export type SeasonStatus = 'draft' | 'published'

export type Season = {
  id: number
  number: number
  name: string | null
  start_date: string
  end_date: string
  battle_points_id: number
  description: string | null
  rules: string | null
  status: SeasonStatus
  created_at: string
  updated_at: string
}

export function formatSeasonName(season: Pick<Season, 'number' | 'name'>): string {
  return season.name ? `Season ${season.number} - ${season.name}` : `Season ${season.number}`
}

function localDateString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function isCurrentSeason(season: Pick<Season, 'start_date' | 'end_date'>): boolean {
  const today = localDateString()
  return season.start_date <= today && season.end_date >= today
}

export function isFutureSeason(season: Pick<Season, 'start_date'>): boolean {
  const today = localDateString()
  return season.start_date > today
}

export function isPastSeason(season: Pick<Season, 'end_date'>): boolean {
  const today = localDateString()
  return season.end_date < today
}

export type SeasonRosterEntry = {
  season_id: number
  profile_id: string
  faction_id: string
  joined_at: string
}
