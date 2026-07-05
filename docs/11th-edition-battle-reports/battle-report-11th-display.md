# Battle Report 11th Edition Display

**Epic:** 11th Edition Battle Reports
**Type:** Feature
**Status:** Done
**Branch:** feature/battle-report-11th-display
**Merge Into:** epic/11th-edition-battle-reports

## Summary

Surface the 11th edition fields everywhere battle reports are read: the detail view shows each player's Force Disposition, derived primary mission, and secondary mode; the feed and admin table handle disposition reports gracefully where they currently assume a single mission. 10th edition reports render exactly as today.

## Acceptance Criteria

- [x] Detail view: disposition reports show each player's Force Disposition and derived primary mission in the Players section, and the Game Details grid replaces the single "Mission" entry with the two primaries (or "A vs B" pairing summary)
- [x] Detail view: recorded secondary modes render per player ("Secondaries: Tactical"); unrecorded modes are omitted, not shown as empty
- [x] Feed cards: disposition reports show the disposition pairing (e.g. "Death Trap vs Reconnaissance Sweep") where classic reports show the mission name
- [x] Admin battle reports table renders disposition reports without an empty Mission cell
- [x] 10th edition reports are pixel-identical to today in all three surfaces
- [x] Round stats, scores, outcomes, tabled, units/models lost render unchanged for both editions

## Implementation

### Key Files

| Action | File | Description |
|---|---|---|
| Modify | `src/app/battle-reports/[id]/page.tsx` | Fetch dispositions + derive primaries; Players section rows; Game Details grid |
| Modify | `src/app/battle-reports/page.tsx` | Feed card mission cell handles disposition reports |
| Modify | `src/app/admin/battle-reports/page.tsx` | Admin table mission cell |
| Modify | `src/modules/battle-report/queries.ts` | Report queries select the four new columns (if not already from the schema feature) |

### Approach

#### 1. Derivation helper

Add `resolvePrimaryMissions(report, missions)` to `src/modules/battle-report/utils.ts` (create if absent): given a report with both dispositions and the edition's mapped missions, return `{ attackerPrimary, defenderPrimary }` (either may be null on misconfigured data — render "—"). Reused by all three surfaces so the matrix lookup isn't triplicated.

#### 2. Detail view

`[id]/page.tsx` already fetches the edition (`line 105`). For disposition reports, additionally fetch `getForceDispositionsByEditionId(report.edition_id)` and `getMissionsByEditionId(report.edition_id)`:

- Players section (`152-234`): add "Force Disposition: <name>", "Primary Mission: <derived>", and (when recorded) "Secondaries: Tactical|Fixed" rows per player.
- Game Details grid (`242-260`): replace the "Mission" cell with "Primary Missions: <attacker> vs <defender>" (single name for mirror matchups). Deployment/Battle Size/Rounds/Edition cells unchanged.

#### 3. Feed + admin table

Both currently print the mission name via a mission lookup map. Extend the lookup: when `mission_id` is null and dispositions are set, print the derived pairing (reuse the helper; fetch dispositions once per page, not per card). Fall back to "—" for drafts with nothing chosen — the current behavior for null missions.

## Key Design Decisions

1. **Shared derivation helper** — Three render surfaces × one matrix rule; a module-level helper keeps the disposition→mission logic in one place alongside the other battle-report utilities.

2. **Pairing string in list surfaces, full breakdown in detail** — Cards and table rows have one line of space; "X vs Y" communicates the matchup. The detail view is where per-player structure belongs.

3. **No new queries for lists** — Feed and admin pages already batch-fetch missions/editions for their lookup maps; dispositions join that pattern (one `getForceDispositionsByEditionId` per edition present in the page's reports).

## Notes

- Depends on `battle-report-force-dispositions.md` (columns + recorded data).
- Leaderboard/standings need no changes: `computeLeaderboard()` (`src/modules/leaderboard/utils.ts:17`) reads only ids, outcomes, and scores — all recorded identically for 11th reports. Per-edition standings filters are a possible future enhancement, out of scope.
- Manual verification: publish one 10th and one 11th report; check detail, feed, and admin table for both; check an 11th draft with no dispositions renders "—" everywhere a mission would show.
