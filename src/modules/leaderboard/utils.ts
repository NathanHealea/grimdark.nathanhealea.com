import type { BattleReport, Outcome } from '@/types/battle-report'

export type LeaderboardEntry = {
  profileId: string
  gamesPlayed: number
  wins: number
  losses: number
  draws: number
  rank: number
}

export function computeLeaderboard(reports: BattleReport[], profileIds?: string[]): LeaderboardEntry[] {
  const stats = new Map<string, { wins: number; losses: number; draws: number }>()

  function tally(profileId: string | null, outcome: Outcome | null) {
    if (!profileId || !outcome) return
    const entry = stats.get(profileId) ?? { wins: 0, losses: 0, draws: 0 }
    if (outcome === 'win') entry.wins++
    else if (outcome === 'loss') entry.losses++
    else if (outcome === 'draw') entry.draws++
    stats.set(profileId, entry)
  }

  for (const report of reports) {
    tally(report.attacker_id, report.attacker_outcome)
    tally(report.defender_id, report.defender_outcome)
  }

  if (profileIds) {
    for (const id of profileIds) {
      if (!stats.has(id)) {
        stats.set(id, { wins: 0, losses: 0, draws: 0 })
      }
    }
  }

  const entries: Omit<LeaderboardEntry, 'rank'>[] = Array.from(stats.entries()).map(([profileId, s]) => ({
    profileId,
    gamesPlayed: s.wins + s.losses + s.draws,
    wins: s.wins,
    losses: s.losses,
    draws: s.draws,
  }))

  entries.sort((a, b) => {
    if (b.gamesPlayed !== a.gamesPlayed) return b.gamesPlayed - a.gamesPlayed
    if (b.wins !== a.wins) return b.wins - a.wins
    if (a.losses !== b.losses) return a.losses - b.losses
    return 0
  })

  const ranked: LeaderboardEntry[] = []
  let currentRank = 1

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    if (i > 0) {
      const prev = entries[i - 1]
      if (entry.gamesPlayed !== prev.gamesPlayed || entry.wins !== prev.wins || entry.losses !== prev.losses) {
        currentRank = i + 1
      }
    }
    ranked.push({ ...entry, rank: currentRank })
  }

  return ranked
}
