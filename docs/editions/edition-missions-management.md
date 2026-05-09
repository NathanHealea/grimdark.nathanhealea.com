# Edition Missions Management

**Epic:** Editions
**Type:** Feature
**Status:** Todo
**Merge Into:** epic/battle-reports

## Summary

Scope missions to editions so that each Warhammer edition has its own list of missions. Add `edition_id` to the existing `missions` table, backfill all existing rows to 10th Edition, and replace the global `unique(name)` constraint with `unique(edition_id, name)`. Provide an admin UI nested under each edition (`/admin/editions/[id]/missions`) for adding, editing, and deleting that edition's missions.

## Acceptance Criteria

### Data Model

- [ ] `missions` table has an `edition_id integer not null references editions(id) on delete cascade` column
- [ ] Existing missions are backfilled to 10th Edition before the `not null` constraint is applied
- [ ] The previous `unique(name)` constraint is dropped; replaced with `unique(edition_id, name)`
- [ ] RLS policies allow public read of missions belonging to published editions; admins/organizers can insert/update/delete

### Admin UI

- [ ] Admins (and organizers) can view the list of missions for a specific edition at `/admin/editions/[id]/missions`
- [ ] Admins can add a new mission to an edition (just `name` for now)
- [ ] Admins can edit an existing mission's name
- [ ] Admins can delete a mission, with a confirmation prompt
- [ ] Mission delete is blocked when battle reports reference it; the action surfaces an error explaining which battle reports block deletion (or how many)
- [ ] The admin edition edit page links to "Manage Missions"

### Read Path Updates

- [ ] `getMissions()` becomes `getMissionsByEditionId(editionId)` — fetches only missions for a given edition
- [ ] Battle report submit/edit forms call this with the currently selected edition

## Database

### Migration: `supabase/migrations/XXXXXX_add_edition_to_missions.sql`

```sql
-- Add column nullable
alter table public.missions
  add column edition_id integer references public.editions(id) on delete cascade;

-- Backfill all existing missions to 10th Edition
update public.missions
   set edition_id = (select id from public.editions where short_name = '10th');

-- Enforce not null
alter table public.missions
  alter column edition_id set not null;

-- Replace global uniqueness with per-edition uniqueness
alter table public.missions
  drop constraint missions_name_key;

alter table public.missions
  add constraint missions_edition_name_unique unique (edition_id, name);
```

### RLS Policy Updates

Replace the existing public read policy with an edition-aware one:

```sql
drop policy if exists "Missions are publicly readable" on public.missions;

create policy "Published edition missions are publicly readable"
  on public.missions for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.editions e
       where e.id = missions.edition_id
         and e.status = 'published'
    )
  );

create policy "Admins and organizers can read all missions"
  on public.missions for select
  to authenticated
  using (
    'admin'     = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can insert missions"
  on public.missions for insert
  to authenticated
  with check (
    'admin'     = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can update missions"
  on public.missions for update
  to authenticated
  using (
    'admin'     = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  )
  with check (
    'admin'     = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can delete missions"
  on public.missions for delete
  to authenticated
  using (
    'admin'     = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );
```

## Implementation

### Key Files

| Action | File                                                            | Description                                                        |
| ------ | --------------------------------------------------------------- | ------------------------------------------------------------------ |
| Create | `supabase/migrations/XXXXXX_add_edition_to_missions.sql`        | Schema, backfill, RLS                                              |
| Modify | `src/types/battle-report.ts`                                    | Add `edition_id` to `Mission` type                                 |
| Modify | `src/modules/battle-report/queries.ts`                          | Replace `getMissions()` with `getMissionsByEditionId(editionId)`   |
| Create | `src/app/admin/editions/[id]/missions/page.tsx`                 | List + add form                                                    |
| Create | `src/app/admin/editions/[id]/missions/[missionId]/edit/page.tsx`| Edit form                                                          |
| Create | `src/app/admin/editions/[id]/missions/actions.ts`               | `createMission`, `updateMission`, `deleteMission` server actions   |

### Type Update

```ts
// src/types/battle-report.ts
export type Mission = {
  id: number
  edition_id: number
  name: string
}
```

### Query Update

```ts
// src/modules/battle-report/queries.ts
export async function getMissionsByEditionId(editionId: number): Promise<Mission[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('edition_id', editionId)
    .order('name')

  if (error) {
    console.error('Failed to fetch missions:', error)
    return []
  }
  return data as Mission[]
}
```

Callers (battle report submit form, edit form, detail view) are updated to pass an `editionId`. The detail view loads the mission directly by id and does not need to filter — but it should still display the mission's edition for clarity.

### Admin UI

`/admin/editions/[id]/missions`:

- Server component fetches the edition and all missions for that edition
- Renders a header showing the edition name and an inline "Add Mission" form (name input + submit)
- Lists existing missions with edit (link) and delete (button) actions
- Uses the same `ActionsMenu` pattern as other admin pages

`/admin/editions/[id]/missions/[missionId]/edit`:

- Single-field edit form (name)
- Delete button with native `confirm()`

### Delete Guard

`deleteMission` runs:

```sql
select count(*) from public.battle_reports where mission_id = :missionId;
```

If > 0, return an error: "Cannot delete this mission: N battle reports reference it. Edit those reports to a different mission first."

If 0, delete and revalidate.

## Key Design Decisions

1. **Cascade missions on edition delete** — Missions are owned by their edition. If the parent edition is deleted (which the admin-edition-management feature only allows when no seasons or battle reports reference it), missions can safely cascade.

2. **Block mission delete when battle reports reference it** — Battle reports may exist outside the parent edition's "in use" check (e.g., if the parent edition is being kept around for historical purposes). Treat the report-level reference as the authoritative check on whether a mission can be removed.

3. **Per-edition unique name, not global** — Missions named the same in two editions are allowed (e.g., if 11th carries forward "Take and Hold"). The `(edition_id, name)` constraint enforces uniqueness only within an edition.

4. **Replace `getMissions()` with `getMissionsByEditionId()`** — Forces every caller to be edition-aware. Keeping a no-arg `getMissions()` would silently return cross-edition results and obscure bugs. Detail views fetch missions by id, which is unaffected by this rename.

5. **Inline add form on the list page** — Adding a mission is a single field; an inline form is faster than a separate page, and the list page reads as the natural home for "manage missions for this edition."

## Implementation Plan

This feature scopes the existing `missions` table to editions. It depends on `editions-data-model.md` (needs the `editions` table + 10th Edition row for backfill) and ideally lands alongside or before `battle-report-edition.md` (which makes the battle report form edition-aware). The admin UI nests under the routes from `admin-edition-management.md`.

### Step 1 — Migration

Create `supabase/migrations/XXXXXX_add_edition_to_missions.sql`. Order matters; follow this exact sequence:

1. `alter table public.missions add column edition_id integer references public.editions(id) on delete cascade;` — nullable initially so the backfill can run.
2. Backfill: `update public.missions set edition_id = (select id from public.editions where short_name = '10th');` This row is guaranteed to exist by the data-model migration.
3. `alter table public.missions alter column edition_id set not null;`
4. `alter table public.missions drop constraint missions_name_key;` — verify the existing constraint name first using `\d missions` in `psql` or by inspecting the schema; the name `missions_name_key` is the Postgres default for `unique not null` from `create_battle_reports.sql` line 9, so this should match.
5. `alter table public.missions add constraint missions_edition_name_unique unique (edition_id, name);`
6. Drop the existing `Missions are publicly readable` policy and create the four edition-aware policies from the Database section.

### Step 2 — Type update

Modify `src/types/battle-report.ts`:

- Change `export type Mission = { id: number; name: string }` to `export type Mission = { id: number; edition_id: number; name: string }`.

### Step 3 — Query update

Modify `src/modules/battle-report/queries.ts`:

1. Replace `export async function getMissions()` with `export async function getMissionsByEditionId(editionId: number)`. Implementation per the doc snippet.
2. Keep one transitional thin wrapper export only if absolutely needed for incremental migration; otherwise remove `getMissions` entirely so the type checker forces every caller to update.

### Step 4 — Update all `getMissions()` callers

Six call sites need updating. The right `editionId` to pass depends on context:

| File | Caller context | What to pass |
| ---- | --------------- | ------------- |
| `src/app/battle-reports/submit/page.tsx` | New report form | The default edition (until battle-report-edition lands), then the form's currently selected edition (after) |
| `src/app/battle-reports/[id]/edit/page.tsx` | Edit existing report | The report's `edition_id` (from `battle-report-edition.md`); fall back to default while that's pending |
| `src/app/battle-reports/[id]/page.tsx` | Detail view | Fetch the single mission by `id` instead — change to `getMissionById` or inline `select` since detail view doesn't need a list |
| `src/app/seasons/[id]/page.tsx` | Season detail | Aggregate across the season's allowed editions (post `season-editions.md`); pre-feature, default edition |
| `src/app/profile/[profileId]/page.tsx` | Profile detail | Same answer as season detail — aggregate or use default |

Practical sequencing for this run: ship `getMissionsByEditionId(defaultEdition.id)` for all callers initially. The `battle-report-edition.md` and `season-editions.md` features will tighten the actual edition source per call site.

If the detail view (`battle-reports/[id]`) and aggregate listing pages need to display mission names without filtering, add `getMissionById(id)` (one-row fetch by primary key, RLS still applies but the row is uniquely identified).

### Step 5 — Admin server actions

Create `src/app/admin/editions/[id]/missions/actions.ts`:

1. `createMission(prevState, formData)`:
   - Role-gate `admin` or `organizer`.
   - Read `edition_id` and `name` from form data.
   - Validate name non-empty and trimmed.
   - Insert. On unique-violation `(edition_id, name)`, return field-level error.
   - `revalidatePath('/admin/editions/[id]/missions', 'page')` (or `revalidatePath('/', 'layout')` for simplicity, matching the seasons pattern).
2. `updateMission(prevState, formData)`:
   - Same role-gate.
   - Read `mission_id`, `name`. Update `name` only — never let an admin reassign `edition_id` (the URL nests the edition; moving missions across editions is out of scope).
3. `deleteMission(missionId, editionId)`:
   - Role-gate.
   - Run delete-guard: `select count(*) from battle_reports where mission_id = :missionId`.
   - If > 0, return `{ error: 'Cannot delete this mission: N battle reports reference it. Edit those reports to a different mission first.' }`.
   - Otherwise delete and revalidate.

### Step 6 — Admin pages

Create:

- `src/app/admin/editions/[id]/missions/page.tsx` — Server component:
  1. Role-gate.
  2. Fetch the edition (404 if missing) and `getMissionsByEditionId(editionId)`.
  3. Render a header with the edition name + back link to `/admin/editions`.
  4. Render an inline `<form action={createMission}>` with a single `name` input + submit button.
  5. List existing missions in a simple `<table>` with Name and Actions columns. Each row links to the edit page and has a delete button (uses a small client component for the `<dialog>` confirmation, mirroring `season-actions.tsx`).
- `src/app/admin/editions/[id]/missions/[missionId]/edit/page.tsx` — Server component:
  1. Role-gate.
  2. Fetch the mission. `notFound()` if missing or if its `edition_id` doesn't match the URL's `[id]` (defends against URL tampering).
  3. Render an edit form with the name input, save button, delete button, and back link.

### Step 7 — Update the admin edition edit page

In `src/app/admin/editions/[id]/edit/page.tsx` (created by `admin-edition-management.md`), add a "Manage Missions" link button that points to `/admin/editions/[id]/missions`. The actions menu on the list page already includes this link per that doc.

### Affected Files

| Action | File | Description |
| ------ | ---- | ----------- |
| Create | `supabase/migrations/XXXXXX_add_edition_to_missions.sql` | Schema, backfill, RLS policies |
| Modify | `src/types/battle-report.ts` | Add `edition_id` to `Mission` type |
| Modify | `src/modules/battle-report/queries.ts` | Replace `getMissions` with `getMissionsByEditionId`; add `getMissionById` |
| Modify | `src/app/battle-reports/submit/page.tsx` | Pass edition id |
| Modify | `src/app/battle-reports/[id]/edit/page.tsx` | Pass edition id |
| Modify | `src/app/battle-reports/[id]/page.tsx` | Switch to `getMissionById` for the detail view |
| Modify | `src/app/seasons/[id]/page.tsx` | Pass edition id (default until season-editions ships) |
| Modify | `src/app/profile/[profileId]/page.tsx` | Pass edition id |
| Create | `src/app/admin/editions/[id]/missions/page.tsx` | List + add form |
| Create | `src/app/admin/editions/[id]/missions/[missionId]/edit/page.tsx` | Edit form |
| Create | `src/app/admin/editions/[id]/missions/actions.ts` | `createMission`, `updateMission`, `deleteMission` |
| Modify | `src/app/admin/editions/[id]/edit/page.tsx` | Link to "Manage Missions" |

### Risks & Considerations

| Risk | Mitigation |
| ---- | ---------- |
| Backfill fails because 10th Edition wasn't seeded | Hard-depends on `editions-data-model.md` migration running first. The `(select id from editions where short_name = '10th')` returns NULL if missing, which causes the subsequent `alter ... set not null` to fail loudly — preferred over silent corruption. |
| Existing constraint name differs from `missions_name_key` | Verify in the database before merging. If it differs (e.g., `missions_name_unique`), update the migration's `drop constraint` line. |
| Six caller updates are easy to miss | Type-system enforcement: removing `getMissions` causes compile errors at every call site. Run `npm run build` and fix all errors before merging. |
| Detail view fetching mission by id loses the public-readability path if the mission's edition is draft | Acceptable — drafts shouldn't appear in published battle reports; admin/organizer policies still let staff see them. If needed, add a fallback render of "Mission unavailable" rather than a hard 500. |
| Admin tries to add a mission with the same name as another edition's mission | Allowed by design — `(edition_id, name)` is the new unique. |
| Admin deletes the mission from the edit form while the URL's `[id]` mismatches | The 404 guard in Step 6 prevents reaching the page; deletion always carries the matched `editionId` in the action call. |
| Dropping the public-read policy mid-migration leaves a brief window where missions are unreadable | Migrations run in a single transaction in Supabase; no observable window. |
| Cascade on edition delete fires before the per-mission FK guard | Cascade is the desired behavior when an edition really is deleted (the parent `admin-edition-management` guard already blocks edition delete if reports reference it). The per-mission guard exists separately for the case where the parent edition stays. |

### Testing

Manual verification:

1. Apply migration. Confirm `select edition_id, count(*) from missions group by edition_id` shows all rows under 10th's id.
2. Confirm `\d missions` shows `unique (edition_id, name)` and no longer the global `unique (name)`.
3. Sign in as admin. Visit `/admin/editions/<10th>/missions` — see all 10 seeded missions.
4. Add a mission named "Test Mission" — appears.
5. Try to add a duplicate "Test Mission" — rejected with field error.
6. Visit `/admin/editions/<11th>/missions` — empty. Add "Take and Hold" — succeeds (allowed because edition differs from 10th's "Take and Hold").
7. Edit "Test Mission" → "Test Mission Renamed" — saves.
8. Delete "Test Mission Renamed" — succeeds.
9. Try to delete a mission referenced by a battle report — blocked with the count message.
10. Verify the battle report submit form still loads (with the default edition) without errors.

## Notes

- The seed data for 11th Edition's missions is **not** part of this migration — the admin enters them manually through the UI once the rules are finalized. This matches the user's requirement.
- After this feature is complete, the battle report form must already be edition-aware (see `battle-report-edition.md`). If that feature ships first, the form temporarily defaults to the default edition's missions.
