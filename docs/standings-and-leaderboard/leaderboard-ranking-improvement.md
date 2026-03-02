# Leaderboard Ranking Improvement

**Epic:** Standings & Leaderboard
**Type:** Enhancement
**Status:** In Progress

## Summary

Evaluate and improve the leaderboard ranking algorithm. The current system prioritizes games played as the primary sort, which rewards activity over competitive performance. This document analyzes the current algorithm, identifies its weaknesses, and proposes alternatives that better reflect player skill and competitive standing.

## Motivation

The current ranking algorithm sorts players primarily by **games played** (descending), then wins, then fewest losses. This means a player with 10 games and 5 wins (50% win rate) ranks higher than a player with 8 games and 7 wins (87.5% win rate). For a competitive league, rankings should primarily reflect how well a player performs, not just how often they show up.

Additionally, the algorithm does not use **scores** (victory points) at all, which are a key differentiator in Warhammer 40k — a player who consistently wins by large margins demonstrates stronger play than one who barely edges out victories.

## Current Ranking Algorithm

**File:** `src/modules/leaderboard/utils.ts` — `computeLeaderboard()`

### Data Used

| Field | Used | Purpose |
|---|---|---|
| `attacker_id` / `defender_id` | Yes | Identify players |
| `attacker_outcome` / `defender_outcome` | Yes | Tally win/loss/draw |
| `attacker_score` / `defender_score` | **No** | Victory points ignored |
| `mission_id`, `deployment_id` | No | Game context ignored |
| `rounds` | No | Game length ignored |
| `event_date` | No | Recency ignored |

### Current Sort Order

| Priority | Criterion | Direction | Rationale |
|---|---|---|---|
| 1 (Primary) | Games Played | Descending | Rewards participation |
| 2 (Secondary) | Wins | Descending | More wins = better |
| 3 (Tertiary) | Losses | Ascending | Fewer losses = better |

### Tie Handling

When two players have identical games played, wins, AND losses, they receive the **same rank number** (standard competition ranking). Example: ranks 1, 1, 3 (not 1, 2, 3).

### LeaderboardEntry Type

```typescript
type LeaderboardEntry = {
  profileId: string
  gamesPlayed: number
  wins: number
  losses: number
  draws: number
  rank: number
}
```

### Example Rankings (Current Algorithm)

| Player | GP | W | L | D | Win% | Rank |
|---|---|---|---|---|---|---|
| Alice | 10 | 5 | 4 | 1 | 50% | 1 |
| Bob | 8 | 7 | 1 | 0 | 87.5% | 2 |
| Carol | 8 | 6 | 2 | 0 | 75% | 3 |
| Dave | 6 | 5 | 1 | 0 | 83% | 4 |

**Problem:** Alice ranks #1 despite a 50% win rate because she played the most games. Bob (87.5% win rate) is stuck at #2.

## Proposed Alternatives

### Option A: Win Rate Primary (with minimum games threshold)

Sort by win rate first, but require a minimum number of games to qualify for ranking.

| Priority | Criterion | Direction |
|---|---|---|
| 1 | Win Rate (`wins / gamesPlayed`) | Descending |
| 2 | Wins (total count) | Descending |
| 3 | Games Played | Descending |

**Minimum games threshold:** Players below the threshold are listed at the bottom (unranked or separate section).

**Pros:**
- Directly rewards competitive performance
- Simple to understand
- Minimum threshold prevents gaming the system (1 game, 1 win = 100%)

**Cons:**
- Choosing the right threshold is subjective (2? 3? 5?)
- In a small league (5-15 players), even 3 games may be a lot early in a season
- Doesn't account for score differentials

**Example (min 3 games):**

| Player | GP | W | L | D | Win% | Rank |
|---|---|---|---|---|---|---|
| Bob | 8 | 7 | 1 | 0 | 87.5% | 1 |
| Dave | 6 | 5 | 1 | 0 | 83% | 2 |
| Carol | 8 | 6 | 2 | 0 | 75% | 3 |
| Alice | 10 | 5 | 4 | 1 | 50% | 4 |

### Option B: Points-Based System

Assign points for outcomes: win = 3 pts, draw = 1 pt, loss = 0 pts. Sort by total points.

| Priority | Criterion | Direction |
|---|---|---|
| 1 | Total Points | Descending |
| 2 | Win Rate | Descending |
| 3 | Score Differential | Descending |

**Pros:**
- Familiar (used in soccer/football leagues worldwide)
- Rewards both winning and playing frequently
- Draws are worth something but less than wins

**Cons:**
- Still favors more games played (more games = more points available)
- Doesn't distinguish narrow wins from dominant wins

**Example (3/1/0):**

| Player | GP | W | L | D | Pts | Rank |
|---|---|---|---|---|---|---|
| Bob | 8 | 7 | 1 | 0 | 21 | 1 |
| Carol | 8 | 6 | 2 | 0 | 18 | 2 |
| Alice | 10 | 5 | 4 | 1 | 16 | 3 |
| Dave | 6 | 5 | 1 | 0 | 15 | 4 |

### Option C: Points-Per-Game (Normalized)

Same point system as Option B, but divide by games played for a per-game average.

| Priority | Criterion | Direction |
|---|---|---|
| 1 | Points Per Game (`totalPoints / gamesPlayed`) | Descending |
| 2 | Total Points | Descending |
| 3 | Games Played | Descending |

**Minimum games threshold** also applies here.

**Pros:**
- Normalizes for activity level — rewards efficiency
- Combines the best of Options A and B
- Still uses the familiar points system

**Cons:**
- Slightly harder to explain to casual players
- Requires minimum threshold (same issue as Option A)

**Example (min 3 games):**

| Player | GP | W | L | D | Pts | PPG | Rank |
|---|---|---|---|---|---|---|---|
| Bob | 8 | 7 | 1 | 0 | 21 | 2.63 | 1 |
| Dave | 6 | 5 | 1 | 0 | 15 | 2.50 | 2 |
| Carol | 8 | 6 | 2 | 0 | 18 | 2.25 | 3 |
| Alice | 10 | 5 | 4 | 1 | 16 | 1.60 | 4 |

### Option D: Score Differential Tiebreaker

Keep any of the above options but add **score differential** (total VP scored minus total VP conceded) as a tiebreaker. This leverages the `attacker_score` and `defender_score` fields that are currently ignored.

Can be added as an additional tiebreaker to any of the above options.

**Pros:**
- Differentiates players with identical records
- Rewards dominant play (winning by more)
- Uses data already captured in battle reports

**Cons:**
- Requires scores to be recorded (they're required for published reports, so this is fine)
- May penalize players in closer, more competitive games

## Acceptance Criteria

- [x] Current ranking algorithm is documented (this document)
- [x] Alternative ranking approaches are documented with trade-offs (this document)
- [x] A ranking approach is chosen and approved
- [x] `computeLeaderboard()` is updated to implement the chosen algorithm
- [x] `LeaderboardEntry` type is updated if new fields are needed (e.g., `winRate`, `points`, `scoreDiff`)
- [x] `LeaderboardTable` displays any new ranking-relevant columns
- [x] Leaderboard page, home page, and season detail page all reflect the new ranking
- [x] Existing behavior is preserved for edge cases (0 games, ties, null scores)

## Approach

### Key Files

| Action | File | Description |
|---|---|---|
| Modify | `src/modules/leaderboard/utils.ts` | Update `computeLeaderboard()` sort logic and `LeaderboardEntry` type |
| Modify | `src/modules/leaderboard/components/leaderboard-table.tsx` | Display new columns/data |
| Verify | `src/app/leaderboard/page.tsx` | Ensure it passes correct data |
| Verify | `src/app/page.tsx` | Home page leaderboard section |
| Verify | `src/app/seasons/[id]/page.tsx` | Season detail leaderboard |

### Implementation Steps

1. **Choose a ranking approach** — Decide on one of the options above (or a hybrid)
2. **Update `LeaderboardEntry` type** — Add fields like `winRate`, `points`, `pointsPerGame`, `scoreDifferential` as needed
3. **Update `computeLeaderboard()`** — Change the sort logic and add any new computed fields
4. **Update `LeaderboardTable`** — Add/modify columns to display the new ranking data
5. **Test edge cases** — 0 games, all draws, null scores, single game played, tied records

## Key Decisions

1. **Decided: Hybrid points-based system with log normalization** — Combines Option B (points: W=3, D=1, L=0) with natural log normalization (`points / ln(gamesPlayed + 2)`) instead of simple per-game division. This gives diminishing returns for more games rather than pure normalization, avoiding the need for a minimum games threshold. Score differential (Option D) serves as tiebreaker.

2. **No minimum games threshold needed** — The `ln(gamesPlayed + 2)` divisor naturally handles low game counts. A player with 1 win (3 pts / ln(3) = 2.73) ranks similarly to a player with 2 wins in 3 games (6 pts / ln(4) = 4.33), which is appropriate. Players with 0 games get a rating of 0.00 and appear at the bottom.

## Notes

- The current algorithm was designed as an MVP — "most active players first" was a reasonable starting point
- Any changes affect three places: leaderboard page, home page section, and season detail pages — but all use the same `computeLeaderboard()` function, so the change is centralized
- Score differential requires `attacker_score` and `defender_score` which are already required for published reports — no data migration needed
- Consider whether the ranking approach should differ between overall (all-time) and per-season leaderboards
