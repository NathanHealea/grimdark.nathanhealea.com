# Battle Report Feed / History

**Epic:** Battle Reports
**Status:** Done

## Summary

A feed page listing all submitted battle reports so members can browse game history.

## Acceptance Criteria

- [x] Feed displays all battle reports in reverse chronological order
- [x] Each entry shows players, factions, outcome, and date
- [x] Entries link to the full battle report detail view
- [x] Viewable by all users (including anonymous)

---

## Implementation

### Query — `getBattleReports()`

**File:** `src/modules/battle-report/queries.ts`

Fetches all battle reports ordered by `created_at` descending. The page enriches the raw data by joining profiles, factions, missions, deployments, and battle points in memory via lookup maps.

### Feed Page (Server Component)

**File:** `src/app/battle-reports/page.tsx`

Server component that:
1. Fetches in parallel: battle reports, profiles, factions, missions, deployments, battle points
2. Builds lookup maps (profile by ID, faction by ID, mission by ID, etc.)
3. Renders a list of battle report cards in reverse chronological order
4. Shows empty state when no reports exist

**Each card displays:**
- Attacker display name + faction label (with parent hierarchy) + score + outcome badge
- Defender display name + faction label (with parent hierarchy) + score + outcome badge
- Mission name, deployment name, battle size, rounds played
- Event date (`event_date`, formatted as "MMM D, YYYY")
- Links to `/battle-reports/{id}` (detail view)

**Outcome badges:**
- Win → `badge badge-success`
- Loss → `badge badge-error`
- Draw → `badge badge-warning`

### Navigation

**File:** `src/components/navbar.tsx`

"Battle Reports" added to `publicLinks` so all users (including anonymous) can browse reports.

### Middleware

**File:** `src/middleware.ts`

`/battle-reports` added to `PUBLIC_ROUTES` so unauthenticated users can view the feed. The `/battle-reports/submit` sub-route handles its own auth guard in the page component.

---

## Files

| Action | File |
|--------|------|
| Modify | `src/modules/battle-report/queries.ts` — `getBattleReports()` |
| Create | `src/app/battle-reports/page.tsx` — feed page |
| Modify | `src/components/navbar.tsx` — "Battle Reports" in public nav links |
| Modify | `src/middleware.ts` — `/battle-reports` in PUBLIC_ROUTES |
