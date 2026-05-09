# Battle Report Edition

**Epic:** Battle Reports
**Type:** Feature
**Status:** Todo
**Merge Into:** epic/battle-reports

## Summary

Tag every battle report with a Warhammer edition and use that edition to filter the mission and deployment dropdowns in the submit and edit forms.

A season is **optional** on a battle report (the existing `season_id` is nullable and remains so). The edition selector adapts to that:

- **With a season selected** — the selector is constrained to the editions that season allows (one season can run multiple editions; see `season-editions.md`) and pre-selects the season's default edition.
- **Without a season selected** — the reporter can pick freely from any published edition, defaulting to the global default edition.

Existing battle reports are backfilled to 10th Edition. The detail view and feed surface the edition for context.

## Acceptance Criteria

### Data Model

- [ ] `battle_reports` table has an `edition_id integer not null references editions(id)` column
- [ ] Existing battle reports are backfilled to 10th Edition before the `not null` constraint is applied
- [ ] Deleting an edition with referencing battle reports is blocked (see `admin-edition-management.md`)

### Submit / Edit Form

- [ ] A battle report can be submitted without a season; `season_id` remains nullable on `battle_reports`
- [ ] When **no season** is selected, the edition selector lists **all published editions** and the reporter can pick any of them; the selector defaults to the global default edition
- [ ] When a season **is** selected, the edition selector lists only that season's allowed editions and pre-selects the season's default edition
  - If the season has exactly one edition, the selector renders as read-only / disabled
  - If the season has multiple editions, the selector is enabled and the player can change it
- [ ] Clearing a previously selected season returns the selector to the full published-editions list (still defaulting to whatever edition was chosen, if it remains valid; otherwise the global default)
- [ ] Mission and deployment dropdowns are filtered to the selected edition
- [ ] Mission and deployment dropdowns are disabled until an edition is determined
- [ ] Changing the edition (directly, or indirectly via season change) clears any previously selected mission/deployment if they don't belong to the new edition
- [ ] Server-side validation rejects submissions where the mission or deployment does not belong to the chosen edition
- [ ] Server-side validation rejects submissions where, if a season is set, the chosen edition is not in that season's allowed editions
- [ ] Validation rejects submissions with no edition (defensive — the form should always provide one, season or no season)

### Display

- [ ] The battle report detail view shows the edition (badge or short_name) alongside mission and deployment
- [ ] The battle report feed/listing card shows the edition badge

## Database

### Migration: `supabase/migrations/XXXXXX_add_edition_to_battle_reports.sql`

```sql
-- Add column nullable
alter table public.battle_reports
  add column edition_id integer references public.editions(id);

-- Backfill all existing reports to 10th Edition
update public.battle_reports
   set edition_id = (select id from public.editions where short_name = '10th');

-- Enforce not null
alter table public.battle_reports
  alter column edition_id set not null;
```

### Optional Integrity Trigger

To prevent client/server bugs from inserting a report whose mission or deployment belongs to a different edition than the report itself, add a constraint trigger:

```sql
create or replace function public.validate_battle_report_edition()
returns trigger as $$
declare
  m_ed integer;
  d_ed integer;
begin
  if new.mission_id is not null then
    select edition_id into m_ed from public.missions where id = new.mission_id;
    if m_ed is distinct from new.edition_id then
      raise exception 'Mission % does not belong to edition %', new.mission_id, new.edition_id;
    end if;
  end if;

  if new.deployment_id is not null then
    select edition_id into d_ed from public.deployments where id = new.deployment_id;
    if d_ed is distinct from new.edition_id then
      raise exception 'Deployment % does not belong to edition %', new.deployment_id, new.edition_id;
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger validate_battle_report_edition
  before insert or update of edition_id, mission_id, deployment_id on public.battle_reports
  for each row execute function public.validate_battle_report_edition();
```

## Implementation

### Key Files

| Action | File                                                       | Description                                                          |
| ------ | ---------------------------------------------------------- | -------------------------------------------------------------------- |
| Create | `supabase/migrations/XXXXXX_add_edition_to_battle_reports.sql` | Schema, backfill, optional integrity trigger                       |
| Modify | `src/types/battle-report.ts`                               | Add `edition_id` to `BattleReport` type                              |
| Modify | `src/modules/battle-report/queries.ts`                     | Use `getMissionsByEditionId` / `getDeploymentsByEditionId`           |
| Modify | `src/modules/battle-report/validation.ts`                  | Add `validateEditionId`                                              |
| Modify | `src/modules/battle-report/components/battle-report-form.tsx` | Edition handling: derive from season, or explicit selector; filter mission/deployment dropdowns |
| Modify | `src/app/battle-reports/submit/actions.ts`                 | Validate edition consistency between report, mission, and deployment |
| Modify | `src/app/battle-reports/[id]/page.tsx` (and edit, if separate) | Display edition badge                                            |
| Modify | `src/app/battle-reports/page.tsx`                          | Display edition badge in feed                                        |

### Type Update

```ts
// src/types/battle-report.ts
export type BattleReport = {
  // ... existing fields
  edition_id: number          // NEW
  // ... rest
}
```

### Form Behavior

The form (client component) tracks `editionId` alongside its existing values state. The flow:

1. **Season is selected** →
   - Look up the season's allowed editions (`season_editions` rows for that season).
   - If exactly one edition is allowed, set `editionId` to it and render the selector as read-only.
   - If multiple editions are allowed, render the selector populated with only those editions, defaulting to the season's default edition (`is_default = true` row).
2. **No season is selected** → show an edition `<select>` populated from `getPublishedEditions()`, defaulting to the global default edition (`editions.is_default = true`).
3. **Edition changes** (either via season change, or via the player changing the selector) → call `getMissionsByEditionId(editionId)` and `getDeploymentsByEditionId(editionId)` to refresh dropdown options. Implementation: pass all editions' missions/deployments down at SSR time, then filter client-side. Avoids a fetch round-trip on every change since the dataset is tiny.
4. **If the previously selected mission or deployment is not in the new edition's list, clear it** and surface an inline note: "Mission and deployment were cleared because they belong to a different edition."
5. **If the user changes the season such that the current edition is not allowed by the new season**, snap the edition to the new season's default edition and re-run step 4.

### Server Action Update

`submitBattleReport` (and the equivalent edit action) gains:

- `validateEditionId(formData)` — required, integer, references a published edition
- After validating mission_id and deployment_id, fetch their `edition_id` and assert equality with the report's `edition_id`. The trigger acts as a backstop, but app-level validation gives a friendlier error.
- If a `season_id` is present, assert that an entry exists in `season_editions` for `(season_id, edition_id)`. Reject otherwise.

### Detail + Feed Display

- Detail page renders an "Edition" row (badge with `short_name`, full `name` as tooltip) near the mission/deployment block.
- Feed cards render the edition badge in the corner of each card alongside existing badges.

## Key Design Decisions

1. **Edition is required on a battle report** — Mirrors the season-edition decision. Lets downstream filters (e.g., "show only 11th Edition reports") work without null handling.

2. **Constrain edition by season, but allow choice when the season runs multiple** — A season can run more than one edition (see `season-editions.md`). If only one is allowed, the form auto-picks it. If several are allowed, the player selects which edition that specific game was played under. This matches league reality during edition rollovers.

3. **Season stays optional; without one, the reporter picks any published edition** — Members may submit non-seasoned reports (between seasons, casual games, friendly matches outside league play). The existing `season_id` nullable column is preserved. With no season the only constraint is that the chosen edition be published — there is no season to narrow the list. Edition is still required because mission/deployment filtering depends on it.

4. **Cascade season change to edition while editing** — If the user changes the season and the current edition is not in the new season's allowed editions, snap to the new season's default edition (which may invalidate the previously selected mission/deployment). Clearing them with an inline note is more honest than silently leaving stale values.

5. **Server-side validation + DB trigger** — App validation gives the user a readable error; the trigger guarantees integrity even if a future code path bypasses validation.

6. **SSR all editions' missions/deployments, filter client-side** — Total volume is small (a few editions × ~10 missions × ~10 deployments). Avoids a fetch round-trip on every edition change. If the dataset grows, switch to a route handler.

## Implementation Plan

This feature is the capstone of the Editions epic. It threads `edition_id` through the battle report data model, the submit/edit form, the server-side validation, and the public detail/feed views. It depends on:

- `editions-data-model.md` — `editions` table and 10th seed.
- `edition-missions-management.md` — `getMissionsByEditionId`, `missions.edition_id`.
- `edition-deployments-management.md` — `getDeploymentsByEditionId`, `deployments.edition_id`.
- `season-editions.md` — strongly recommended for the season-constrained selector behavior. If shipping first, fall back to the unconstrained selector populated from `getPublishedEditions()`.

### Step 1 — Migration

Create `supabase/migrations/XXXXXX_add_edition_to_battle_reports.sql`:

1. `alter table public.battle_reports add column edition_id integer references public.editions(id);` — nullable initially.
2. Backfill: `update public.battle_reports set edition_id = (select id from public.editions where short_name = '10th');`.
3. `alter table public.battle_reports alter column edition_id set not null;`.
4. Add the `validate_battle_report_edition()` plpgsql function and the `before insert or update of edition_id, mission_id, deployment_id` trigger from the Database section.

The trigger is defensive — app-level validation runs first and gives readable errors. The trigger guarantees integrity if a future code path bypasses validation.

### Step 2 — Type update

Modify `src/types/battle-report.ts`:

- Add `edition_id: number` to the `BattleReport` type. Place it next to `mission_id` / `deployment_id` for cohesion.

### Step 3 — Validation

Modify `src/modules/battle-report/validation.ts`:

1. Add `editionId: string` to `BattleReportFormState` form-state shape.
2. Add `validateEditionId(value: string): string | null` matching the patterns of `validateSeasonId`. Required if status is `'published'`; allowed empty for drafts (match the existing season behavior — confirm by inspecting `validateSeasonId`).

### Step 4 — Queries module

Modify `src/modules/battle-report/queries.ts`:

1. Switch `getMissions`/`getDeployments` callers to the per-edition versions added by the missions/deployments features.
2. Add a small helper `getEditionsForSubmitForm(seasonId: number | null): Promise<{ editions: Edition[]; defaultEditionId: number | null }>` that:
   - If `seasonId` is null, returns `getPublishedEditions()` and the global default edition's id.
   - If `seasonId` is set, returns the editions allowed by that season (via `season_editions` join + `editions` lookup) and the season's default edition id.
   - This consolidates the dual-mode logic for the submit/edit page server components.

### Step 5 — Form component

Modify `src/modules/battle-report/components/battle-report-form.tsx` (client):

1. Add `editionId` to the form's local state.
2. Add new props:
   - `publishedEditions: Edition[]` — fallback list when no season is selected.
   - `seasonEditionsMap: Record<number, { editions: Edition[]; defaultEditionId: number }>` — per-season allowed editions and default. Pre-computed at SSR time for every season the dropdown can offer; tiny dataset.
   - `missionsByEdition: Record<number, Mission[]>` — every published edition's missions, pre-fetched at SSR time and filtered client-side.
   - `deploymentsByEdition: Record<number, Deployment[]>` — same for deployments.
3. Render an "Edition" `<select>` between the Season selector and the Mission selector:
   - When `seasonId` is null: populated from `publishedEditions`, default to global default edition id.
   - When `seasonId` is set and the season has multiple editions: populated from `seasonEditionsMap[seasonId].editions`, default to that season's default edition.
   - When `seasonId` is set and the season has exactly one edition: render the field as a disabled `<select>` (or read-only label) showing that edition's name. Still emit the value via a hidden input so the server receives it.
4. On `editionId` change (or season change cascading to edition):
   - If the previously selected `mission_id` is not in `missionsByEdition[editionId]`, clear it and set an inline note "Mission was cleared because it belongs to a different edition. Pick again."
   - Same for `deployment_id`.
5. Mission and deployment dropdowns are filtered to `missionsByEdition[editionId]` and `deploymentsByEdition[editionId]`. Disable them while `editionId` is null (shouldn't happen given the defaults, but defensive).
6. On season change:
   - Look up `seasonEditionsMap[newSeasonId]`. If `editionId` is in its allowed list, leave it. Otherwise snap to the season's default edition (and re-run the mission/deployment clear in step 4).

### Step 6 — Submit / edit pages SSR data

Modify `src/app/battle-reports/submit/page.tsx` and `src/app/battle-reports/[id]/edit/page.tsx`:

1. Fetch in parallel:
   - `getPublishedEditions()`
   - All seasons (for the dropdown — already there).
   - `getSeasonEditionsBatch(seasons.map(s => s.id))` to build `seasonEditionsMap`.
   - For each published edition, `getMissionsByEditionId` and `getDeploymentsByEditionId`. Aggregate into the two `Record<editionId, ...>` shapes.
2. Pass these as props to the `<BattleReportForm />`. The edit page also passes the report's existing `edition_id` for pre-fill.

### Step 7 — Server actions

Modify `src/app/battle-reports/submit/actions.ts` (and any equivalent edit action — usually the same file or `[id]/edit/actions.ts`):

1. Read `edition_id` from form data.
2. Validate via `validateEditionId`.
3. After validating mission and deployment ids, fetch the row and assert their `edition_id` matches the report's `edition_id`. Return field-level errors otherwise.
4. If `season_id` is set, run `select 1 from season_editions where season_id = :s and edition_id = :e` and reject if no row.
5. Include `edition_id` in the insert/update payload.

### Step 8 — Display: detail view

Modify `src/app/battle-reports/[id]/page.tsx`:

1. Fetch the edition (one extra `.from('editions').select('id, name, short_name').eq('id', report.edition_id)` call, or join via Supabase nested select on the existing report fetch).
2. Add a row to the mission/deployment block: "Edition: <badge with short_name, full name as title attribute>".

### Step 9 — Display: feed

Modify `src/app/battle-reports/page.tsx` and the feed card component:

1. Include `edition_id` (and joined `editions.short_name`) in the existing report query.
2. Render the edition badge in the corner of each card alongside existing badges.

### Affected Files

| Action | File | Description |
| ------ | ---- | ----------- |
| Create | `supabase/migrations/XXXXXX_add_edition_to_battle_reports.sql` | Schema, backfill, integrity trigger |
| Modify | `src/types/battle-report.ts` | Add `edition_id` to `BattleReport` |
| Modify | `src/modules/battle-report/validation.ts` | Add `validateEditionId`; extend `BattleReportFormState` |
| Modify | `src/modules/battle-report/queries.ts` | Add `getEditionsForSubmitForm`; wire up to `getMissionsByEditionId`/`getDeploymentsByEditionId` |
| Modify | `src/modules/battle-report/components/battle-report-form.tsx` | Edition selector, season-cascading default, dropdown filtering |
| Modify | `src/app/battle-reports/submit/actions.ts` | Validate edition + cross-check mission/deployment/season-editions |
| Modify | `src/app/battle-reports/submit/page.tsx` | SSR fetch editions, season-edition map, missions-by-edition, deployments-by-edition |
| Modify | `src/app/battle-reports/[id]/edit/page.tsx` | Same SSR additions; pre-fill edition |
| Modify | `src/app/battle-reports/[id]/page.tsx` | Render edition badge |
| Modify | `src/app/battle-reports/page.tsx` | Render edition badge in feed |

### Risks & Considerations

| Risk | Mitigation |
| ---- | ---------- |
| Backfill misses reports because 10th wasn't seeded | Hard depends on `editions-data-model.md`. The `set not null` step fails loudly. |
| Missions/deployments without `edition_id` exist when this migration runs | Hard depends on `edition-missions-management.md` and `edition-deployments-management.md` having run first. The trigger function uses those columns and would fail at insert/update otherwise. Sequence the migrations correctly. |
| Trigger blocks legitimate updates that change one of the three columns at a time | Trigger fires `before insert or update of edition_id, mission_id, deployment_id` and only validates the post-update state. Should be fine for partial updates. |
| Form state desync when season change cascades to edition cascade to mission/deployment clear | Implement the cascade as a single `setState` derivation: compute new state from the new season id and apply atomically, rather than sequentially via independent handlers. |
| "Inline note" UX duplicates between mission and deployment clears | Use a single state slot for the note, last-write-wins, cleared on user action. |
| Existing reports' season may not list their backfilled edition (10th) | The backfill in `season-editions.md` ensures every existing season has 10th as default, so this stays consistent. New seasons created without 10th would fail this check for old reports — handled by the season form not allowing zero editions, plus the `removed-edition-with-reports` warning. |
| SSR payload size grows with editions × missions × deployments | Total volume is small (single-digit editions × ~10 each). Acceptable. If dataset grows, switch the form to a route handler that fetches on edition change. |
| `edition_id` not nullable when `season_id` is null | Acceptable per the design — edition is always required even without a season. The form defaults to global default. |
| Drafts may carry a now-deleted-mission or now-deleted-deployment | Mission/deployment deletes are blocked by the per-feature delete guards. Not reachable. |

### Testing

Manual verification:

1. Apply migration. Confirm `select count(*) from battle_reports where edition_id is null` returns 0.
2. Confirm trigger rejects: `update battle_reports set mission_id = <mission whose edition differs> where id = ...` should error.
3. Submit a battle report **without** a season — edition selector lists all published editions, defaults to global default. Mission/deployment lists are filtered to that edition.
4. Submit a battle report with a season that allows only 10th — edition is locked to 10th.
5. Submit a battle report with a season that allows 10th + 11th — edition selector enabled, defaults to season's default. Switch edition; mission and deployment clear with the inline note.
6. Edit a published report — pre-fills the existing edition.
7. Try (via direct API) to insert a report with mission and edition mismatched — the trigger errors with the explicit message.
8. Verify detail view and feed both render the edition badge.

## Notes

- This feature depends on `editions-data-model.md`, `edition-missions-management.md`, and `edition-deployments-management.md` being applied first. It also benefits from `season-editions.md` being applied first (so the season-constrained edition selector is meaningful), but it can ship before season-editions by falling back to the explicit selector populated from all published editions.
- After this feature ships, the standings/leaderboard page and stats analytics can filter by edition in addition to season.
- A potential follow-up: when a member opens the submit form, default the edition to whatever the active season is using, even if no season is yet selected — small UX polish, deferred.
