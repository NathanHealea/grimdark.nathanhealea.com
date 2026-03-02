# Leaderboard Ranking Improvement

**Epic:** Standings & Leaderboard
**Type:** Enhancement
**Status:** Completed

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

1. **Decided: Hybrid points-based system with log normalization** — Points: W=4, D=2, L=1 (every outcome awards at least 1 point, so any player who has played ranks above inactive players). Uses natural log normalization (`points / ln(gamesPlayed + 2)`) instead of simple per-game division. This gives diminishing returns for more games rather than pure normalization, avoiding the need for a minimum games threshold. Score differential (Option D) serves as tiebreaker.

2. **No minimum games threshold needed** — The `ln(gamesPlayed + 2)` divisor naturally handles low game counts. A player with 1 win (4 pts / ln(3) = 3.64) ranks below a player with 2 wins in 3 games (9 pts / ln(5) = 5.59), which is appropriate. Every outcome awards at least 1 point, so any player who has played always ranks above inactive players. Players with 0 games get a rating of 0.00 and appear at the bottom.

## Implementation

### Chosen Algorithm: Points-Based with Log Normalization

A hybrid of Options B and D with natural log normalization. Players earn points for outcomes, which are then normalized by a logarithmic function of games played. Score differential breaks ties.

### Data Used

| Field | Used | Purpose |
|---|---|---|
| `attacker_id` / `defender_id` | Yes | Identify players |
| `attacker_outcome` / `defender_outcome` | Yes | Tally win/loss/draw and compute points |
| `attacker_score` / `defender_score` | **Yes** | Compute VP scored and VP conceded per player |
| `mission_id`, `deployment_id` | No | Not used in ranking |
| `rounds` | No | Not used in ranking |
| `event_date` | No | Not used in ranking |

### Points

Each game outcome awards a fixed number of points:

| Outcome | Points |
|---|---|
| Win | 4 |
| Draw | 2 |
| Loss | 1 |

Every outcome awards at least 1 point, so any player who has played a game always ranks above inactive players (0 points).

**Formula:** `points = (wins × 4) + (draws × 2) + (losses × 1)`

### Rating (Normalized Score)

Raw points are divided by the natural log of `gamesPlayed + 2` to produce the **rating**. This compresses the advantage of playing more games — each additional game adds less to the divisor, so prolific players don't run away with the rankings, but playing more games still matters slightly.

**Formula:** `rating = points / ln(gamesPlayed + 2)`

The `+ 2` offset ensures the divisor is always at least `ln(2) ≈ 0.693`, avoiding division by zero and keeping 1-game ratings reasonable. Players with 0 games get a rating of `0.00`.

The result is rounded to 2 decimal places for display.

**Example calculations:**

| Player | GP | W | L | D | Pts | ln(GP+2) | Rating |
|---|---|---|---|---|---|---|---|
| Bob | 8 | 7 | 1 | 0 | 29 | ln(10) = 2.30 | 29 / 2.30 = **12.61** |
| Dave | 6 | 5 | 1 | 0 | 21 | ln(8) = 2.08 | 21 / 2.08 = **10.10** |
| Carol | 8 | 6 | 2 | 0 | 26 | ln(10) = 2.30 | 26 / 2.30 = **11.30** |
| Alice | 10 | 5 | 4 | 1 | 26 | ln(12) = 2.48 | 26 / 2.48 = **10.48** |
| Eve | 1 | 1 | 0 | 0 | 4 | ln(3) = 1.10 | 4 / 1.10 = **3.64** |
| Frank | 0 | 0 | 0 | 0 | 0 | ln(2) = 0.69 | 0 / 0.69 = **0.00** |

### Score Differential

**VP scored** is the victory points a player earned in a game. **VP conceded** is the victory points their opponent earned in the same game. These are accumulated across all games.

For each battle report:
- The **attacker's** VP scored = `attacker_score`, VP conceded = `defender_score`
- The **defender's** VP scored = `defender_score`, VP conceded = `attacker_score`

**Formula:** `scoreDifferential = vpScored − vpConceded`

A positive differential means the player outscores their opponents overall. A negative differential means they are outscored. This serves as the primary tiebreaker when two players have the same rating.

Null scores (from incomplete reports) are treated as `0`.

### Sort Order

| Priority | Criterion | Direction | Description |
|---|---|---|---|
| 1 (Primary) | Rating | Descending | Points normalized by log of games played |
| 2 (Tiebreaker) | Score Differential | Descending | VP scored minus VP conceded |
| 3 (Tiebreaker) | Points | Descending | Raw outcome points |

### Tie Handling

Standard competition ranking is preserved. Players with identical rating, score differential, AND points receive the same rank number. Example: ranks 1, 1, 3 (not 1, 2, 3).

### Updated LeaderboardEntry Type

```typescript
type LeaderboardEntry = {
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
```

### Table Columns

The leaderboard table displays the following columns (desktop view):

| Column | Header | Description |
|---|---|---|
| Rank | # | Position in standings |
| Player | Player | Avatar and display name |
| Rating | Rating | Normalized score (2 decimal places) |
| Points | Pts | Raw outcome points (W×4 + D×2 + L×1) |
| Score Diff | +/− | VP scored minus VP conceded (color-coded: green positive, red negative) |
| Games Played | GP | Total games |
| Wins | W | Total wins (green) |
| Losses | L | Total losses (red) |
| Draws | D | Total draws (yellow) |

Mobile cards show the same data in a compact inline format.

### Edge Cases

| Case | Behavior |
|---|---|
| 0 games played | Rating = 0.00, all stats = 0, appears at bottom |
| All draws | Points = draws × 1, rating computed normally |
| Null scores | Treated as 0 for VP calculations |
| Single game played | Rating computed with ln(3) ≈ 1.10 as divisor |
| Tied records | Same rank number assigned (standard competition ranking) |

## Notes

- The current algorithm was designed as an MVP — "most active players first" was a reasonable starting point
- Any changes affect three places: leaderboard page, home page section, and season detail pages — but all use the same `computeLeaderboard()` function, so the change is centralized
- Score differential requires `attacker_score` and `defender_score` which are already required for published reports — no data migration needed
- Consider whether the ranking approach should differ between overall (all-time) and per-season leaderboards
