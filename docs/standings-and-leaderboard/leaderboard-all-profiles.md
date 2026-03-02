# Leaderboard Shows All Profiles

**Epic:** Standings & Leaderboard
**Type:** Enhancement
**Status:** Completed

## Summary

Update both the season leaderboard and the overall leaderboard to show all relevant profiles — not just those who appear in battle reports. The season leaderboard should include every roster member (even with 0 games), and the overall leaderboard should include every member/organizer on the site.

## Motivation

Currently, `computeLeaderboard()` only builds entries from profiles that appear in battle reports. This means:

- **Season leaderboard**: A player who joins a season roster but hasn't played any games yet is invisible on the leaderboard. This is confusing — they joined the season but don't appear in standings.
- **Overall leaderboard**: A member who hasn't played any games doesn't appear at all. New members have no visibility until their first game is recorded.

Both cases should show these profiles with a 0W/0L/0D record so everyone is accounted for.

## Acceptance Criteria

- [x] `computeLeaderboard()` accepts an optional `profileIds` parameter — an array of profile IDs to always include
- [x] Profiles in the `profileIds` list that have no battle reports appear with 0 games played, 0 wins, 0 losses, 0 draws
- [x] Profiles with battle reports are unaffected — their stats are computed as before
- [x] The season detail page passes roster profile IDs to `computeLeaderboard()`
- [x] The overall leaderboard page passes all member/organizer profile IDs to `computeLeaderboard()`
- [x] Zero-game profiles are ranked below profiles with games (sorted to the bottom)
- [x] Zero-game profiles share the same rank as each other (tie handling)

## Approach

### Step 1: Add `profileIds` parameter to `computeLeaderboard()`

Modify the function signature to accept an optional second argument:

```typescript
export function computeLeaderboard(
  reports: BattleReport[],
  profileIds?: string[]
): LeaderboardEntry[]
```

After tallying stats from battle reports, iterate `profileIds` and add any missing profile IDs to the stats map with `{ wins: 0, losses: 0, draws: 0 }`. This ensures they appear in the final sorted output.

The existing sort (games played desc, wins desc, losses asc) will naturally push 0-game profiles to the bottom.

### Step 2: Update the season detail page

In `src/app/seasons/[id]/page.tsx`, extract roster profile IDs and pass them to `computeLeaderboard()`:

```typescript
const rosterProfileIds = roster.map((r) => r.profile_id)
const entries = computeLeaderboard(
  battleReports.filter((r) => r.status === 'published'),
  rosterProfileIds
)
```

### Step 3: Update the overall leaderboard page

In `src/app/leaderboard/page.tsx`, extract all member/organizer profile IDs and pass them:

```typescript
const allProfileIds = (profiles as Profile[] ?? []).map((p) => p.id)
const standings = computeLeaderboard(battleReports, allProfileIds)
```

### Key Files

| Action | File | Description |
|---|---|---|
| Modify | `src/modules/leaderboard/utils.ts` | Add optional `profileIds` param to `computeLeaderboard()` |
| Modify | `src/app/seasons/[id]/page.tsx` | Pass roster profile IDs to `computeLeaderboard()` |
| Modify | `src/app/leaderboard/page.tsx` | Pass all member/organizer profile IDs to `computeLeaderboard()` |

## Key Decisions

1. **Optional parameter over a new function** — Adding an optional `profileIds` param keeps the API backward-compatible. Callers that don't pass it get the current behavior. No need for a separate function.

2. **Inject profile IDs at the call site, not inside `computeLeaderboard()`** — The leaderboard utility stays pure (no DB queries). Each page decides which profiles to include based on its own context (roster for seasons, all members for the overall board).

3. **Sort naturally pushes zero-game profiles to bottom** — The existing sort by games played (desc) already handles this. No special sorting logic needed for zero-game entries.
