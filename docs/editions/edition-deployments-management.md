# Edition Deployments Management

**Epic:** Editions
**Type:** Feature
**Status:** Completed
**Merge Into:** epic/battle-reports

## Summary

Scope deployments to editions so that each Warhammer edition has its own list of deployment options. Add `edition_id` to the existing `deployments` table, backfill all existing rows to 10th Edition, and replace the global `unique(name)` constraint with `unique(edition_id, name)`. Provide an admin UI nested under each edition (`/admin/editions/[id]/deployments`) for adding, editing, and deleting that edition's deployments.

## Acceptance Criteria

### Data Model

- [x] `deployments` table has an `edition_id integer not null references editions(id) on delete cascade` column
- [x] Existing deployments are backfilled to 10th Edition before the `not null` constraint is applied
- [x] The previous `unique(name)` constraint is dropped; replaced with `unique(edition_id, name)`
- [x] RLS policies allow public read of deployments belonging to published editions; admins/organizers can insert/update/delete

### Admin UI

- [x] Admins (and organizers) can view the list of deployments for a specific edition at `/admin/editions/[id]/deployments`
- [x] Admins can add a new deployment to an edition (just `name` for now)
- [x] Admins can edit an existing deployment's name
- [x] Admins can delete a deployment, with a confirmation prompt
- [x] Deployment delete is blocked when battle reports reference it; the action surfaces an error explaining which battle reports block deletion (or how many)
- [ ] The admin edition edit page links to "Manage Deployments" *(deferred to admin-edition-management)*

### Read Path Updates

- [x] `getDeployments()` becomes `getDeploymentsByEditionId(editionId)` — fetches only deployments for a given edition
- [x] Battle report submit/edit forms call this with the currently selected edition

## Database

### Migration: `supabase/migrations/XXXXXX_add_edition_to_deployments.sql`

```sql
-- Add column nullable
alter table public.deployments
  add column edition_id integer references public.editions(id) on delete cascade;

-- Backfill all existing deployments to 10th Edition
update public.deployments
   set edition_id = (select id from public.editions where short_name = '10th');

-- Enforce not null
alter table public.deployments
  alter column edition_id set not null;

-- Replace global uniqueness with per-edition uniqueness
alter table public.deployments
  drop constraint deployments_name_key;

alter table public.deployments
  add constraint deployments_edition_name_unique unique (edition_id, name);
```

### RLS Policy Updates

Same shape as the missions RLS update:

```sql
drop policy if exists "Deployments are publicly readable" on public.deployments;

create policy "Published edition deployments are publicly readable"
  on public.deployments for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.editions e
       where e.id = deployments.edition_id
         and e.status = 'published'
    )
  );

create policy "Admins and organizers can read all deployments"
  on public.deployments for select
  to authenticated
  using (
    'admin'     = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can insert deployments"
  on public.deployments for insert
  to authenticated
  with check (
    'admin'     = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can update deployments"
  on public.deployments for update
  to authenticated
  using (
    'admin'     = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  )
  with check (
    'admin'     = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can delete deployments"
  on public.deployments for delete
  to authenticated
  using (
    'admin'     = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );
```

## Implementation

### Key Files

| Action | File                                                                       | Description                                                            |
| ------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Create | `supabase/migrations/XXXXXX_add_edition_to_deployments.sql`                | Schema, backfill, RLS                                                  |
| Modify | `src/types/battle-report.ts`                                               | Add `edition_id` to `Deployment` type                                  |
| Modify | `src/modules/battle-report/queries.ts`                                     | Replace `getDeployments()` with `getDeploymentsByEditionId(editionId)` |
| Create | `src/app/admin/editions/[id]/deployments/page.tsx`                         | List + add form                                                        |
| Create | `src/app/admin/editions/[id]/deployments/[deploymentId]/edit/page.tsx`     | Edit form                                                              |
| Create | `src/app/admin/editions/[id]/deployments/actions.ts`                       | `createDeployment`, `updateDeployment`, `deleteDeployment` server actions |

### Type Update

```ts
// src/types/battle-report.ts
export type Deployment = {
  id: number
  edition_id: number
  name: string
}
```

### Query Update

```ts
// src/modules/battle-report/queries.ts
export async function getDeploymentsByEditionId(editionId: number): Promise<Deployment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('deployments')
    .select('*')
    .eq('edition_id', editionId)
    .order('name')

  if (error) {
    console.error('Failed to fetch deployments:', error)
    return []
  }
  return data as Deployment[]
}
```

Detail views fetch a deployment by id directly and are unaffected.

### Admin UI

`/admin/editions/[id]/deployments`:

- Server component fetches the edition and all deployments for that edition
- Renders a header showing the edition name and an inline "Add Deployment" form (name input + submit)
- Lists existing deployments with edit (link) and delete (button) actions
- Uses the same `ActionsMenu` pattern as other admin pages

`/admin/editions/[id]/deployments/[deploymentId]/edit`:

- Single-field edit form (name)
- Delete button with native `confirm()`

### Delete Guard

`deleteDeployment` runs:

```sql
select count(*) from public.battle_reports where deployment_id = :deploymentId;
```

If > 0, return an error: "Cannot delete this deployment: N battle reports reference it. Edit those reports to a different deployment first."

If 0, delete and revalidate.

## Key Design Decisions

1. **Same architecture as missions** — Deployments and missions are siblings; keeping their data model, RLS, and UI patterns identical reduces cognitive overhead and makes the codebase symmetrical.

2. **Cascade deployments on edition delete** — Deployments are entirely owned by their edition. The admin-edition-management feature only allows edition delete when no seasons or battle reports reference the edition, so cascade is safe.

3. **Block deployment delete when battle reports reference it** — Same reasoning as missions: report-level references are authoritative.

4. **Per-edition unique name, not global** — Deployment names may carry forward across editions; uniqueness is scoped to the edition.

5. **Inline add form on the list page** — Single-field input fits naturally on the list; matches the missions UX.

## Implementation Plan

This feature mirrors `edition-missions-management.md` exactly, applied to the `deployments` table. It depends on `editions-data-model.md` for the `editions` table and 10th Edition seed. It is independent of the missions feature — they can ship in either order. Where this doc diverges from the missions plan, the difference is called out explicitly; otherwise the same patterns apply.

### Step 1 — Migration

Create `supabase/migrations/XXXXXX_add_edition_to_deployments.sql`. Same six-step sequence as missions:

1. Add nullable `edition_id integer references editions(id) on delete cascade`.
2. Backfill: `update public.deployments set edition_id = (select id from public.editions where short_name = '10th');`.
3. `alter ... set not null`.
4. `drop constraint deployments_name_key` (verify name; same Postgres default as missions).
5. Add `unique (edition_id, name)` constraint.
6. Drop the existing `Deployments are publicly readable` policy and create the four edition-aware policies from the Database section.

The migration filename should not collide with the missions migration timestamp; pick the next available timestamp at merge time.

### Step 2 — Type update

Modify `src/types/battle-report.ts`:

- Change `export type Deployment = { id: number; name: string }` to `export type Deployment = { id: number; edition_id: number; name: string }`.

### Step 3 — Query update

Modify `src/modules/battle-report/queries.ts`:

1. Replace `getDeployments()` with `getDeploymentsByEditionId(editionId: number)` per the doc snippet.
2. Add `getDeploymentById(id: number)` for the detail view code path that just needs to display a single deployment by id.

### Step 4 — Update all `getDeployments()` callers

Same six call sites as missions (often same files, same function-pair imports). Use the same edition-source decisions (default edition until `battle-report-edition.md` and `season-editions.md` tighten them):

| File | What to pass |
| ---- | ------------- |
| `src/app/battle-reports/submit/page.tsx` | Default edition id; later, the form's selected edition |
| `src/app/battle-reports/[id]/edit/page.tsx` | The report's `edition_id`; default until that column exists |
| `src/app/battle-reports/[id]/page.tsx` | Switch to `getDeploymentById` |
| `src/app/seasons/[id]/page.tsx` | Default edition id |
| `src/app/profile/[profileId]/page.tsx` | Default edition id |

In practice, the missions and deployments query refactors usually happen in the same PR even though their migrations are independent — every page that imports `getMissions` also imports `getDeployments`. Coordinate the two changes if shipping in the same PR; otherwise update the imports independently as each migration lands.

### Step 5 — Admin server actions

Create `src/app/admin/editions/[id]/deployments/actions.ts` mirroring the missions actions:

1. `createDeployment(prevState, formData)` — same shape, hits `deployments` table, surfaces the unique-violation as a field error.
2. `updateDeployment(prevState, formData)` — name only; `edition_id` is fixed.
3. `deleteDeployment(deploymentId, editionId)` — guard via `select count(*) from battle_reports where deployment_id = :id`; block if > 0.

### Step 6 — Admin pages

Create:

- `src/app/admin/editions/[id]/deployments/page.tsx` — same layout as the missions list page: header, inline add form, table of existing deployments with edit link and delete button.
- `src/app/admin/editions/[id]/deployments/[deploymentId]/edit/page.tsx` — single-field edit form with delete button. `notFound()` if the deployment's `edition_id` doesn't match the URL's `[id]`.

Reuse the same delete-confirmation client component pattern. If a sufficiently generic `<DeleteConfirmButton>` was already extracted during the missions feature, reuse it here. Otherwise duplicate the small confirmation dialog inline.

### Step 7 — Update the admin edition edit page

Add a "Manage Deployments" link button on `/admin/editions/[id]/edit` (alongside the "Manage Missions" link added by the missions feature).

### Affected Files

| Action | File | Description |
| ------ | ---- | ----------- |
| Create | `supabase/migrations/XXXXXX_add_edition_to_deployments.sql` | Schema, backfill, RLS policies |
| Modify | `src/types/battle-report.ts` | Add `edition_id` to `Deployment` type |
| Modify | `src/modules/battle-report/queries.ts` | Replace `getDeployments` with `getDeploymentsByEditionId`; add `getDeploymentById` |
| Modify | `src/app/battle-reports/submit/page.tsx` | Pass edition id |
| Modify | `src/app/battle-reports/[id]/edit/page.tsx` | Pass edition id |
| Modify | `src/app/battle-reports/[id]/page.tsx` | Switch to `getDeploymentById` |
| Modify | `src/app/seasons/[id]/page.tsx` | Pass edition id |
| Modify | `src/app/profile/[profileId]/page.tsx` | Pass edition id |
| Create | `src/app/admin/editions/[id]/deployments/page.tsx` | List + add form |
| Create | `src/app/admin/editions/[id]/deployments/[deploymentId]/edit/page.tsx` | Edit form |
| Create | `src/app/admin/editions/[id]/deployments/actions.ts` | `createDeployment`, `updateDeployment`, `deleteDeployment` |
| Modify | `src/app/admin/editions/[id]/edit/page.tsx` | Link to "Manage Deployments" |

### Risks & Considerations

| Risk | Mitigation |
| ---- | ---------- |
| Backfill fails because 10th Edition wasn't seeded | Hard-depends on `editions-data-model.md`. The `set not null` step fails loudly if the backfill returned NULL. |
| Existing constraint name differs from `deployments_name_key` | Verify with `\d deployments` before merging. |
| Both this migration and the missions migration race on RLS policy renames | Each operates on its own table and policies; no conflict. |
| Pages still importing `getDeployments` after rename | Type-system enforcement: the rename causes compile errors at every import. Run `npm run build`. |
| Detail view fetching a deployment whose edition is draft | Same mitigation as missions: admin/organizer policies cover staff; published reports referencing draft-edition deployments are an unusual state and an acceptable "Deployment unavailable" fallback works. |
| Coordinated UI imports between missions and deployments features | If they ship in separate PRs, the second PR may need a small follow-up to update files the first PR already touched. Plan for one rebasing pass before merging the second. |

### Testing

Manual verification, mirroring the missions feature:

1. Apply migration. Confirm all existing deployments now have `edition_id = 10th's id`.
2. `\d deployments` shows the new `unique (edition_id, name)` constraint.
3. Sign in as admin. Visit `/admin/editions/<10th>/deployments` — see all 7 seeded deployments.
4. Add a new deployment. Confirm appears.
5. Add a duplicate within 10th — rejected.
6. Visit `/admin/editions/<11th>/deployments` — empty. Add "Hammer and Anvil" — succeeds.
7. Edit and rename a deployment — saves.
8. Delete an unused deployment — succeeds.
9. Try deleting a deployment referenced by a battle report — blocked with the count message.
10. Verify the battle report submit form still loads and lists default-edition deployments.

## Notes

- 11th Edition's deployments are populated manually by the admin once the rules are finalized — not seeded by this migration.
- The two migrations (missions and deployments) are independent and can run in either order, but both depend on the editions table existing and 10th Edition being seeded.
