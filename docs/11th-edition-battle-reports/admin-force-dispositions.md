# Admin Force Dispositions Management

**Epic:** 11th Edition Battle Reports
**Type:** Feature
**Status:** Completed
**Branch:** feature/admin-force-dispositions
**Merge Into:** epic/11th-edition-battle-reports

## Summary

Give admins and organizers a management page for an edition's Force Dispositions, mirroring the existing per-edition missions and deployments admin pages, and extend the mission admin form with the disposition mapping fields (deck + opponent disposition) so the 5×5 matrix stays maintainable without SQL.

## Acceptance Criteria

- [x] `/admin/editions/[id]/force-dispositions` lists the edition's dispositions with add/edit/delete, guarded by `hasAnyRole(admin|organizer)` like the missions page
- [x] Admins can create, rename, and edit the description of a disposition
- [x] Deleting a disposition is blocked with a readable error when missions map to it or battle reports reference it
- [x] The mission form (`/admin/editions/[id]/missions`) gains optional "Disposition deck" and "Vs opponent disposition" selects populated from the edition's dispositions
- [x] The disposition selects are hidden entirely for editions with no dispositions (10th edition admin UX is unchanged)
- [x] Mission validation enforces both-or-neither on the two mapping fields and surfaces the duplicate-pairing unique violation as a friendly field error
- [x] The missions list page shows each mission's deck and opponent disposition (e.g. "Take and Hold → vs Disruption") for mapped missions
- [x] Non-admin/organizer users cannot reach the page or invoke the actions

## Routes

| Route | Description |
|---|---|
| `/admin/editions/[id]/force-dispositions` | List + add dispositions for an edition |
| `/admin/editions/[id]/force-dispositions/[forceDispositionId]/edit` | Edit / delete a disposition |

## Implementation

### Key Files

| Action | File | Description |
|---|---|---|
| Create | `src/app/admin/editions/[id]/force-dispositions/page.tsx` | List + inline add form (mirror `deployments/page.tsx`) |
| Create | `src/app/admin/editions/[id]/force-dispositions/actions.ts` | `createForceDisposition` / `updateForceDisposition` / `deleteForceDisposition` |
| Create | `src/app/admin/editions/[id]/force-dispositions/force-disposition-form.tsx` | Name + description form |
| Create | `src/app/admin/editions/[id]/force-dispositions/force-disposition-actions.tsx` | Row actions (edit link, delete button) |
| Create | `src/app/admin/editions/[id]/force-dispositions/[forceDispositionId]/edit/page.tsx` | Edit page |
| Modify | `src/app/admin/editions/[id]/missions/mission-form.tsx` | Add the two disposition selects (conditional on the edition having dispositions) |
| Modify | `src/app/admin/editions/[id]/missions/actions.ts` | Accept + validate the mapping fields in `createMission` / `updateMission` |
| Modify | `src/app/admin/editions/[id]/missions/page.tsx` | Fetch dispositions; show mapping column in the list; pass dispositions to the form |
| Modify | `src/app/admin/editions/[id]/missions/[missionId]/edit/page.tsx` | Same for the edit form |

### Approach

#### 1. Force dispositions pages

Copy the deployments admin structure verbatim (`src/app/admin/editions/[id]/deployments/`) — same role guard, same form/action split, same revalidation. The only addition is the `description` textarea.

`deleteForceDisposition` guard order (mirror `deleteMission`'s referenced-by-battle-reports guard at `missions/actions.ts:108-122`):

1. `missions` where `force_disposition_id` or `opponent_force_disposition_id` matches → "Cannot delete: N missions are mapped to this disposition."
2. `battle_reports` where `attacker_force_disposition_id` or `defender_force_disposition_id` matches → "Cannot delete: referenced by battle reports." (Column exists after `battle-report-force-dispositions.md`; implement defensively — skip the check if the column is absent, or land this feature after that one. Preferred: land after, keep the check unconditional.)

The `on delete restrict` FKs from the data-model feature are the backstop.

#### 2. Mission form mapping fields

`mission-form.tsx` receives `forceDispositions: ForceDisposition[]`. When empty, render exactly today's form. When non-empty, add two selects ("Disposition deck", "Vs opponent disposition"), both defaulting to the mission's current values (edit) or empty (create). Both optional as a pair — a mapped edition can still hold unmapped/experimental missions; the battle report form only surfaces missions via disposition lookups, so unmapped rows are inert.

`createMission`/`updateMission` validate: both set or both empty; on the `missions_disposition_pairing_unique` violation return "This deck already has a mission against that opponent disposition."

## Key Design Decisions

1. **Mirror, don't abstract** — The missions and deployments admin pages are intentionally parallel copies. A third copy keeps the established pattern; extracting a generic CRUD abstraction is a refactor outside this epic's scope.

2. **Mapping editing lives on the mission, not the disposition** — The matrix cell is a property of the mission row (see the data-model doc). Editing it where missions are edited avoids a second matrix-editor UI.

3. **Conditional UI instead of edition checks** — The mission form branches on "does this edition have dispositions", not on edition id, consistent with the epic-wide detection rule.

## Notes

- Depends on `force-dispositions-data-model.md`; land after `battle-report-force-dispositions.md` so the battle-report delete guard can be unconditional.
- The `/admin/editions` list and edition CRUD pages referenced by the back-buttons still don't exist (pre-existing gap tracked by `docs/editions/admin-edition-management.md`, outside this epic).
- Manual verification: add/rename/delete a disposition on a scratch edition; confirm delete blocks on a mapped disposition; create a duplicate pairing and confirm the friendly error; confirm the 10th edition mission form shows no disposition fields.
