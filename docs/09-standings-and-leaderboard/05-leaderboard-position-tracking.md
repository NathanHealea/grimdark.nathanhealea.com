# Leaderboard Position Tracking

**Epic:** Standings & Leaderboard
**Type:** Feature
**Status:** Todo

## Summary

Track and display each player's leaderboard position changes over time. When a battle report is submitted, the leaderboard positions for all affected players are recalculated and a snapshot is stored. The leaderboard UI then shows whether each player has advanced, stayed, or descended in rank compared to their previous position — both for overall standings and per-season standings.

## Acceptance Criteria

- [ ] When a battle report is published, a position snapshot is recorded for all ranked players (overall and season)
- [ ] The leaderboard table displays a movement indicator next to each player's rank (up arrow, down arrow, or dash/no change)
- [ ] Movement indicators show the direction and magnitude of change (e.g., +2, -1, =)
- [ ] New players (first appearance on the leaderboard) show a "new" indicator instead of a movement arrow
- [ ] Overall and season leaderboards track positions independently
- [ ] When a battle report is edited or its status changes (draft/published), positions are recalculated
- [ ] Position history is queryable per player (for future profile stats pages)

## Routes

No new routes. Existing routes modified:

| Route | Description |
|---|---|
| `/leaderboard` | Show position movement indicators |
| `/` (home) | Show position movement in home page leaderboard |
| `/seasons/[id]` | Show position movement in season leaderboard |

## Database

### Migration: `supabase/migrations/XXXXXX_create_leaderboard_snapshots.sql`

Create a table to store position snapshots each time rankings are recalculated.

```sql
CREATE TABLE public.leaderboard_snapshots (
  id bigserial PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id),
  season_id integer REFERENCES public.seasons(id) ON DELETE CASCADE,
  -- NULL season_id = overall standings; non-null = season-specific
  rank integer NOT NULL,
  games_played integer NOT NULL,
  wins integer NOT NULL,
  losses integer NOT NULL,
  draws integer NOT NULL,
  battle_report_id uuid REFERENCES public.battle_reports(id),
  -- The battle report that triggered this snapshot
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for efficient lookups: "latest snapshot per player per scope"
CREATE INDEX idx_leaderboard_snapshots_lookup
  ON leaderboard_snapshots (profile_id, season_id, created_at DESC);

-- Index for "all snapshots triggered by a battle report"
CREATE INDEX idx_leaderboard_snapshots_report
  ON leaderboard_snapshots (battle_report_id);
```

### RLS Policies

- **SELECT:** Public read — leaderboard data is public
- **INSERT:** Service role only (inserted by server actions, not directly by users)
- **UPDATE:** None — snapshots are immutable
- **DELETE:** Admins only (for cleanup if needed)

### Design: Why a snapshots table?

**Alternative considered: Compute on the fly**
Instead of storing snapshots, compute the "previous" leaderboard from all reports except the latest one, then compare ranks. This avoids a new table but is expensive (O(n) recomputation for every page load) and can't show history over time.

**Alternative considered: Store only deltas**
Store only the change (+1, -1, 0) per player. Simpler table, but loses the ability to reconstruct full historical rankings or calculate multi-step changes.

**Chosen: Full snapshots**
Store the complete rank + stats for each player after each battle report. This enables:
- Efficient "current vs previous" comparisons (just query latest two snapshots)
- Historical rank tracking for future features (rank graph on profile page)
- Accurate recalculation if battle reports are edited/deleted

## Implementation

### Key Files

| Action | File | Description |
|---|---|---|
| Create | `supabase/migrations/XXXXXX_create_leaderboard_snapshots.sql` | New snapshots table with RLS |
| Create | `src/modules/leaderboard/snapshots.ts` | Server-side functions: `recordSnapshot()`, `getLatestPositions()`, `getPreviousPositions()` |
| Modify | `src/modules/leaderboard/utils.ts` | Add `computeMovement()` helper to compare current vs previous positions |
| Modify | `src/modules/leaderboard/components/leaderboard-table.tsx` | Display movement indicators (arrows + magnitude) |
| Modify | `src/app/battle-reports/submit/actions.ts` | Call `recordSnapshot()` after successful publish |
| Modify | `src/app/battle-reports/[id]/edit/actions.ts` | Call `recordSnapshot()` after edit that changes status or outcomes |
| Modify | `src/app/leaderboard/page.tsx` | Fetch and pass position data to table |
| Modify | `src/app/page.tsx` | Fetch and pass position data to home leaderboard |
| Modify | `src/app/seasons/[id]/page.tsx` | Fetch and pass position data to season leaderboard |

### Approach

#### 1. Database migration

Create the `leaderboard_snapshots` table with indexes and RLS policies. The table stores one row per player per scope (overall or season) per snapshot event.

#### 2. Snapshot recording logic

Create `src/modules/leaderboard/snapshots.ts` with:

```typescript
// Record a full leaderboard snapshot after a battle report is published
async function recordSnapshot(battleReportId: string, seasonId: number | null): Promise<void>
```

This function:
1. Fetches all published battle reports (overall scope) or season-scoped reports
2. Calls `computeLeaderboard()` to get current rankings
3. Inserts one row per ranked player into `leaderboard_snapshots`
4. Records both overall (season_id = NULL) and season-specific snapshots

#### 3. Position comparison queries

```typescript
// Get the most recent snapshot for each player in a scope
async function getLatestPositions(seasonId: number | null): Promise<Map<string, number>>

// Get the second-most-recent snapshot for comparison
async function getPreviousPositions(seasonId: number | null): Promise<Map<string, number>>

// Compute movement: current rank - previous rank (negative = improved)
function computeMovement(
  entries: LeaderboardEntry[],
  previousPositions: Map<string, number>
): Map<string, { direction: 'up' | 'down' | 'same' | 'new'; magnitude: number }>
```

#### 4. Update LeaderboardEntry type

Add an optional `movement` field:

```typescript
export type LeaderboardEntry = {
  profileId: string
  gamesPlayed: number
  wins: number
  losses: number
  draws: number
  rank: number
  movement?: {
    direction: 'up' | 'down' | 'same' | 'new'
    magnitude: number  // how many positions changed (0 for 'same' and 'new')
  }
}
```

#### 5. Update LeaderboardTable UI

Add a movement indicator column next to the rank:

| Indicator | Meaning | Style |
|---|---|---|
| `+2` with up arrow | Advanced 2 positions | Green / success |
| `-1` with down arrow | Descended 1 position | Red / error |
| `=` or dash | No change | Gray / muted |
| `NEW` | First time on leaderboard | Blue / info badge |

On mobile cards, show the indicator as a small badge next to the rank number.

#### 6. Wire up battle report actions

In both `submitBattleReport` and `updateBattleReport` server actions, after a successful insert/update of a **published** report:

```typescript
// After successful battle report publish
if (status === 'published') {
  await recordSnapshot(reportId, seasonId ? Number(seasonId) : null)
}
```

This triggers snapshot recording for both overall and the relevant season (if assigned).

#### 7. Wire up leaderboard pages

Each leaderboard page fetches previous positions and attaches movement data before rendering:

```typescript
const entries = computeLeaderboard(reports)
const previousPositions = await getPreviousPositions(seasonId)
const movement = computeMovement(entries, previousPositions)
// Attach movement to entries before passing to LeaderboardTable
```

## Key Design Decisions

1. **Full snapshots over deltas** — Storing the complete rank per snapshot enables historical tracking, profile rank graphs, and accurate recalculation. The storage cost is minimal for a 5-15 player league (a few dozen rows per battle report).

2. **Server-side snapshot recording** — Snapshots are recorded in the server action immediately after a battle report is published. This ensures consistency — the snapshot matches the exact state of the leaderboard at that moment. No client-side or cron-based approach needed.

3. **NULL season_id for overall** — Using NULL to represent overall standings avoids a separate table or magic ID. The index on `(profile_id, season_id, created_at DESC)` handles both scopes efficiently.

4. **Immutable snapshots** — Snapshots are never updated, only inserted. This creates an audit trail. If a battle report is edited, a new snapshot is recorded reflecting the new state — the old snapshot remains for historical reference.

5. **Movement shown as relative change, not absolute** — Showing "+2" (moved up 2 spots) is more intuitive than showing "was rank 5, now rank 3". The direction arrow provides at-a-glance understanding.

## Notes

- **Dependency:** This feature depends on the ranking algorithm. If the ranking improvement (see `leaderboard-ranking-improvement.md`) is implemented first, the snapshots will automatically reflect the new algorithm since they use `computeLeaderboard()`.
- **Data volume:** For a 15-player league with ~50 battle reports per season, each report creates ~30 snapshot rows (15 players x 2 scopes). A full season produces ~1,500 rows — negligible for Postgres.
- **First run:** When first deployed, there will be no previous snapshots, so all players will show "NEW". After the first battle report is submitted post-deployment, movement tracking begins.
- **Future:** The snapshots table enables future features like rank history graphs on player profiles, "biggest mover" widgets, and season-over-season comparisons.
- **Edge case: Draft reports** — Only published reports trigger snapshots. Saving a draft does not affect rankings.
- **Edge case: Report deletion** — If a battle report is deleted (future feature), a new snapshot should be recorded to reflect the updated standings.
