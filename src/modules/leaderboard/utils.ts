import type { BattleReport, Outcome } from '@/types/battle-report'

export type LeaderboardEntry = {
  profileId: string
  gamesPlayed: number
  wins: number
  losses: number
  draws: number
  points: number
  normalizedScore: number
  vpScored: number
  vpConceded: number
  scoreDifferential: number
  rank: number
}

export function computeLeaderboard(reports: BattleReport[], profileIds?: string[]): LeaderboardEntry[] {
  const stats = new Map<string, { wins: number; losses: number; draws: number; vpScored: number; vpConceded: number }>()

  function tally(profileId: string | null, outcome: Outcome | null, scored: number | null, conceded: number | null) {
    if (!profileId || !outcome) return
    const entry = stats.get(profileId) ?? { wins: 0, losses: 0, draws: 0, vpScored: 0, vpConceded: 0 }
    if (outcome === 'win') entry.wins++
    else if (outcome === 'loss') entry.losses++
    else if (outcome === 'draw') entry.draws++
    entry.vpScored += scored ?? 0
    entry.vpConceded += conceded ?? 0
    stats.set(profileId, entry)
  }

  for (const report of reports) {
    tally(report.attacker_id, report.attacker_outcome, report.attacker_score, report.defender_score)
    tally(report.defender_id, report.defender_outcome, report.defender_score, report.attacker_score)
  }

  if (profileIds) {
    for (const id of profileIds) {
      if (!stats.has(id)) {
        stats.set(id, { wins: 0, losses: 0, draws: 0, vpScored: 0, vpConceded: 0 })
      }
    }
  }

  const entries: Omit<LeaderboardEntry, 'rank'>[] = Array.from(stats.entries()).map(([profileId, s]) => {
    const gamesPlayed = s.wins + s.losses + s.draws
    const points = s.wins * 4 + s.draws * 2 + s.losses * 1
    const normalizedScore = gamesPlayed > 0 ? points / Math.log(gamesPlayed + 2) : 0
    return {
      profileId,
      gamesPlayed,
      wins: s.wins,
      losses: s.losses,
      draws: s.draws,
      points,
      normalizedScore: Math.round(normalizedScore * 100) / 100,
      vpScored: s.vpScored,
      vpConceded: s.vpConceded,
      scoreDifferential: s.vpScored - s.vpConceded,
    }
  })

  entries.sort((a, b) => {
    if (b.normalizedScore !== a.normalizedScore) return b.normalizedScore - a.normalizedScore
    if (b.scoreDifferential !== a.scoreDifferential) return b.scoreDifferential - a.scoreDifferential
    if (b.points !== a.points) return b.points - a.points
    return 0
  })

  const ranked: LeaderboardEntry[] = []
  let currentRank = 1

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    if (i > 0) {
      const prev = entries[i - 1]
      if (
        entry.normalizedScore !== prev.normalizedScore ||
        entry.scoreDifferential !== prev.scoreDifferential ||
        entry.points !== prev.points
      ) {
        currentRank = i + 1
      }
    }
    ranked.push({ ...entry, rank: currentRank })
  }

  return ranked
}
