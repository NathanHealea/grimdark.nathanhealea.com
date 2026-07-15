# Battle Report Detail View

**Epic:** Battle Reports
**Type:** Feature
**Status:** Completed

## Summary

A detail page for each battle report showing the full game summary.

## Acceptance Criteria

- [x] Each battle report has a unique detail page
- [x] Detail view displays both players, factions, points, outcome, and mission
- [x] Links to the participating members' profiles

---

## Implementation

### Query — `getBattleReportById()`

**File:** `src/modules/battle-report/queries.ts` (added to existing)

Fetches a single battle report by UUID. Returns `null` if not found (triggers 404).

### Detail Page (Server Component)

**File:** `src/app/battle-reports/[id]/page.tsx`

Server component that:
1. Reads the `id` param from the route
2. Fetches in parallel: battle report by ID, profiles, factions, missions, deployments, battle points
3. Returns `notFound()` if the report doesn't exist
4. Builds lookup maps and renders the full report

**Layout:**
- Back link to `/battle-reports`
- Card with title "Battle Report" and event date
- Attacker and defender sections in a two-column grid, each showing:
  - Player name linked to `/profile/[id]`
  - Faction label (with parent hierarchy)
  - Score and outcome badge (win/loss/draw)
- Game Details section with mission, deployment, battle size (with points), and rounds played
- Footer showing who reported the battle and when (`created_at`)

### Routing

`/battle-reports/[id]` — already public via middleware `startsWith('/battle-reports')` matching. No middleware changes needed.

---

## Files

| Action | File |
|--------|------|
| Modify | `src/modules/battle-report/queries.ts` — add `getBattleReportById()` |
| Create | `src/app/battle-reports/[id]/page.tsx` — detail page |
