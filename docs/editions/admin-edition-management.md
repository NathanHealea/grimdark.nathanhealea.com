# Admin Edition Management

**Epic:** Editions
**Type:** Feature
**Status:** Completed
**Branch:** epic/edition-management
**Merge Into:** main

## Summary

Provide an admin UI for managing editions: list, create, edit, delete, and set the default edition. The page is accessible at `/admin/editions` and follows the same pattern as `/admin/seasons`. Members never create editions — they only select from the published editions admins have prepared.

## Acceptance Criteria

- [x] Admins (and organizers) can view a list of all editions at `/admin/editions`
- [x] List shows name, short name, status (draft/published), default flag, and counts of missions, deployments, dispositions, and battle reports
- [x] Admins can create a new edition (name, short_name, description, status)
- [x] Admins can edit an existing edition's name, short_name, description, and status
- [x] Admins can mark an edition as the default; doing so unsets the previous default
- [x] Admins can delete an edition only when no battle reports reference it; the action is blocked with a clear message otherwise
- [x] An "Editions" link appears in the admin navigation
- [x] Non-admins (excluding organizers) receive 403 / unauthorized when attempting to access admin edition routes (enforced by middleware)
- [x] Each edition row links to its missions and deployments management pages

## Routes

| Route                          | Description                                       |
| ------------------------------ | ------------------------------------------------- |
| `/admin/editions`              | List of all editions; create button               |
| `/admin/editions/new`          | Create form                                       |
| `/admin/editions/[id]/edit`    | Edit form (with delete + set-default actions)     |

The missions and deployments management routes (`/admin/editions/[id]/missions` and `/admin/editions/[id]/deployments`) are defined in their respective feature docs.

## Implementation

### Key Files

| Action | File                                              | Description                                                  |
| ------ | ------------------------------------------------- | ------------------------------------------------------------ |
| Create | `src/app/admin/editions/page.tsx`                 | List page                                                    |
| Create | `src/app/admin/editions/new/page.tsx`             | Create form page                                             |
| Create | `src/app/admin/editions/[id]/edit/page.tsx`       | Edit form page                                               |
| Create | `src/app/admin/editions/edition-form.tsx`         | Shared client form component for create/edit                 |
| Create | `src/app/admin/editions/actions.ts`               | `createEdition`, `updateEdition`, `deleteEdition`, `setDefaultEdition` server actions |
| Modify | `src/routes.ts`                                   | Add `/admin/editions` to `adminLinks`                        |

### Server Actions

In `src/app/admin/editions/actions.ts`:

- `createEdition(formData)` — validates input, inserts a new edition. If `is_default` is true, first sets all other editions to `is_default = false`.
- `updateEdition(id, formData)` — validates input, updates edition fields. Preserves the default constraint.
- `setDefaultEdition(id)` — convenience action to mark an edition as default; transactionally unsets the previous default.
- `deleteEdition(id)` — checks for any referencing seasons or battle reports. If found, returns an error explaining what blocks the delete. Otherwise deletes the edition (which will cascade or SET NULL on missions/deployments per the FK rule defined in those feature docs).

All actions verify the user has `admin` or `organizer` role and call `revalidatePath('/', 'layout')` on success.

### Form

The shared `edition-form.tsx` client component provides:

- Fields: name (text), short_name (text, lowercased on blur), description (textarea), status (select: draft/published), is_default (checkbox)
- Uses `useActionState` for server-action feedback
- Validation: name and short_name required, short_name unique (handled server-side, surfaced as inline error)

### List Page

Server component at `/admin/editions`:

- Fetches all editions and aggregate counts (missions, deployments, seasons, battle reports) per edition in parallel
- Renders a table with: name, short_name, status badge, default badge, counts, and an `ActionsMenu` (Edit, Set as Default, Delete, Manage Missions, Manage Deployments)
- "Create Edition" button at the top

### Set-Default Action

The default flag is enforced via the partial unique index defined in the data-model feature. The `setDefaultEdition` server action runs both updates inside a single SQL transaction:

```sql
update public.editions set is_default = false where is_default = true;
update public.editions set is_default = true  where id = :id;
```

### Delete Guard

`deleteEdition` first runs:

```sql
select
  (select count(distinct season_id) from public.season_editions where edition_id = :id) as season_count,
  (select count(*) from public.battle_reports where edition_id = :id)                   as report_count;
```

If either count is > 0, return an error like:
"Cannot delete this edition: it is allowed by N seasons and used by M battle reports. Remove it from those seasons (or delete those records) first."

Missions and deployments scoped to the edition are deleted with the edition (FK `on delete cascade`) since they have no value without their parent edition.

## Key Design Decisions

1. **Block delete when in use, rather than SET NULL** — Editions are infrequent admin events. Orphaning battle reports or season-edition associations would create filtering ambiguity (e.g., "show 10th edition reports" suddenly excludes orphans). Forcing the admin to clean up first keeps invariants clean.

2. **Cascade missions and deployments on edition delete** — Missions and deployments are entirely owned by their edition; they have no independent identity. If the edition is gone, so are its scenarios. Battle reports do not reference missions/deployments directly through edition (FKs go to `missions.id`/`deployments.id`), so a cascade plan must coexist with the report-side guard. See edition-missions-management.md and edition-deployments-management.md for details.

3. **Organizers can manage editions** — Mirrors how organizers can manage seasons (`20260227230005_allow_organizer_on_seasons.sql`). Editions are a similar low-risk admin task.

4. **Single shared form for create and edit** — Same pattern as `season-form.tsx`. Keeps validation and field rendering consistent.

5. **Counts surfaced on the list page** — Helps the admin understand the impact of deleting or reconfiguring an edition without navigating away.

## Implementation Plan

This feature builds the admin CRUD surface on top of the schema delivered by `editions-data-model.md`. It must land **after** that doc's migration, because the queries and forms here read/write the `editions` table. It can land **before** the missions/deployments management features — those features add their own routes and link to (but do not modify) this page.

### Step 1 — Confirm prerequisites

1. The `editions` table, RLS policies, and `getEditions/getDefaultEdition/getEditionById` queries from `editions-data-model.md` exist on the working branch. If not, this feature blocks on that one.
2. The `season_editions` table and `battle_reports.edition_id` column referenced by the delete guard are owned by `season-editions.md` and `battle-report-edition.md`. While the delete guard query references both, this feature can ship those references behind a runtime check (e.g., the join table may not exist yet at admin-edition-management implementation time). Plan accordingly: implement the guard so it gracefully reports zero counts if a referencing table is missing, and tighten it in the dependent features. **Pragmatic choice for this run:** implement the guard against whichever of `season_editions` / `battle_reports.edition_id` already exist; if neither exists yet, the guard is a no-op and delete simply runs.

### Step 2 — Routes file update

Modify `src/routes.ts`:

1. Add `{ href: '/admin/editions', label: 'Editions' }` to the `adminLinks` array, immediately after the `/admin/seasons` entry. This places the link adjacent to its nearest sibling in the admin nav.

### Step 3 — Server actions

Create `src/app/admin/editions/actions.ts` modeled on `src/app/admin/seasons/actions.ts`:

1. Define `EditionFormState = FormState<{ name: string; short_name: string; description: string; status: string; is_default: string }>`.
2. Implement `createEdition(prevState, formData)`:
   - Verify `user` is signed in; verify `hasAnyRole(user.id, ['admin', 'organizer'])`.
   - Read `name`, `short_name`, `description`, `status`, `is_default` from `formData`.
   - Validate: name required, short_name required and matching `/^[a-z0-9-]+$/`, status in `['draft', 'published']`.
   - If `is_default = true`, run `update editions set is_default = false where is_default = true` first, then insert. Use a single Supabase RPC if you want strict atomicity, but a sequential pair of calls in a server action is acceptable given the partial unique index already prevents a true race window (the second statement would fail).
   - On unique-violation on `short_name`, return a field-level error (`errors: { short_name: '...' }`).
   - `revalidatePath('/', 'layout')`; return `{ success: 'Edition created.' }`.
3. Implement `updateEdition(prevState, formData)` symmetrically; reads `edition_id` from a hidden input.
4. Implement `setDefaultEdition(id: number)`:
   - Same role check.
   - Run two updates in sequence: clear all `is_default`, then set the target. Wrap in try/catch and return `{ error }` on failure. Returns `{ success: true }` on completion (callers re-fetch from the list page after `revalidatePath`).
5. Implement `deleteEdition(id: number)`:
   - Same role check.
   - Run the delete-guard counts (only against tables that exist; guard each in its own try and treat missing-table errors as zero).
   - If either count > 0, return `{ error: 'Cannot delete this edition: ...' }` with explicit numbers.
   - Otherwise `delete from editions where id = :id`, then `revalidatePath('/', 'layout')`.

All four actions log unexpected errors with `console.error('Failed to ...:', error)` and return a generic `{ error: 'Failed to ...' }` for the user.

### Step 4 — Form component

Create `src/app/admin/editions/edition-form.tsx` modeled on `season-form.tsx`:

- Client component using `useActionState` and a `startTransition` submit handler that wraps `formAction(new FormData(e.currentTarget))`.
- Accepts `{ edition?: Edition }`. Picks the right action (`createEdition` vs `updateEdition`) based on `edition` presence.
- Fields:
  - `name` (text input)
  - `short_name` (text input; on blur, lower-case and strip whitespace via a small `onBlur` handler — do not enforce server-side casing transformation in actions, only validate)
  - `description` (textarea, optional)
  - `status` (select: Draft / Published)
  - `is_default` (checkbox; if the current edition is already default, render the checkbox checked and disabled with helper text "Use the 'Set as Default' action on the list page to change the default.")
- Inline error rendering follows the seasons pattern (`state?.errors?.field` adds `input-error` class and a `<p className="text-error">` below).

### Step 5 — List page

Create `src/app/admin/editions/page.tsx` modeled on `src/app/admin/seasons/page.tsx`:

1. Verify the caller via the same role-gate pattern used in other `/admin/*` server pages — `redirect('/')` (or 404) if the user is not admin/organizer.
2. Fetch `getEditions({ includeAll: true })`.
3. Fetch counts in parallel:
   - Missions per edition: `select edition_id, count(*) from missions group by edition_id` (or compute client-side from a single fetch). Skip if the column doesn't exist yet — render `—`.
   - Deployments per edition: same approach.
   - Seasons per edition: `select edition_id, count(distinct season_id) from season_editions group by edition_id`. Skip if the table doesn't exist yet.
   - Battle reports per edition: `select edition_id, count(*) from battle_reports where edition_id is not null group by edition_id`. Skip if column missing.
4. Render a table: Name | Short Name | Status | Default | Missions | Deployments | Seasons | Reports | Actions.
5. Render an `EditionActions` row component (analogous to `SeasonActions`) with a dropdown of: Edit, Set as Default, Manage Missions (link to `/admin/editions/[id]/missions`), Manage Deployments (link to `/admin/editions/[id]/deployments`), Delete.
6. "Create Edition" button at the top right links to `/admin/editions/new`.

### Step 6 — Create and edit pages

Create the two server-component pages:

- `src/app/admin/editions/new/page.tsx`: role-gate, then render `<EditionForm />`.
- `src/app/admin/editions/[id]/edit/page.tsx`: role-gate, fetch `getEditionById(id)`, `notFound()` if null, then render `<EditionForm edition={edition} />`.

Both pages follow the same `<main className="page-layout"><div className="page-container"><div className="page-content">...` shell as the seasons admin pages.

### Step 7 — EditionActions client component

Create `src/app/admin/editions/edition-actions.tsx` modeled on `season-actions.tsx`:

- Client component receiving `editionId`, `editionName`, `isDefault`, plus boolean flags indicating whether each manage-link is available.
- A DaisyUI dropdown wrapping the action buttons. "Delete" opens a confirmation `<dialog>`. "Set as Default" runs `setDefaultEdition` via a `startTransition` wrapper around a server action. Surfaces results via a small toast or inline alert (match the existing pattern used by `season-actions.tsx`).

### Affected Files

| Action | File | Description |
| ------ | ---- | ----------- |
| Create | `src/app/admin/editions/page.tsx` | List page with counts and actions menu |
| Create | `src/app/admin/editions/new/page.tsx` | Create form route |
| Create | `src/app/admin/editions/[id]/edit/page.tsx` | Edit form route |
| Create | `src/app/admin/editions/edition-form.tsx` | Shared form component |
| Create | `src/app/admin/editions/edition-actions.tsx` | Per-row actions dropdown |
| Create | `src/app/admin/editions/actions.ts` | `createEdition`, `updateEdition`, `setDefaultEdition`, `deleteEdition` |
| Modify | `src/routes.ts` | Add `Editions` to `adminLinks` |

### Risks & Considerations

| Risk | Mitigation |
| ---- | ---------- |
| Delete guard references tables/columns that don't exist yet | Wrap each count query in its own try/catch and treat `relation does not exist` as zero. Tighten in the dependent feature when those columns land. |
| Two admins concurrently set different editions as default | The partial unique index makes the second `update is_default = true` fail. Surface the error message; the admin can refresh and retry. |
| `short_name` casing inconsistency | Client-side blur handler lowercases the value; server-side validation rejects strings outside `/^[a-z0-9-]+$/`. |
| Removing the default from an edition leaves the league with no default | Block this in the form: `is_default` cannot be unchecked through edit; only `setDefaultEdition` (which always promotes another) can change which edition is default. |
| Organizer accidentally deleting an in-use edition | The delete guard plus the confirmation dialog covers this. |
| Cascade behavior of `on delete cascade` for missions/deployments not yet in place | The cascade is owned by the missions/deployments feature migrations. Until those land, deleting an edition with missions would error with a FK violation; the guard already prevents this once those features add their FKs. |
| Forgetting to run `revalidatePath` after `setDefaultEdition` | Explicit step in the action; verify the list page reflects the change after the action without manual reload. |

### Testing

No automated test suite exists in the repo. Manual verification:

1. Sign in as admin: `/admin/editions` loads and shows 10th and 11th.
2. Create a draft edition (e.g., "12th"); confirm it appears with the Draft badge and is_default unchecked.
3. Edit 11th, change description, save, confirm change persists.
4. Use Set as Default on 11th; confirm 10th's default badge disappears and 11th's appears.
5. Delete the 12th draft (no references); confirm it disappears.
6. Try to delete 10th once `season_editions` / `battle_reports.edition_id` exist with references; confirm the guard message names the counts.
7. Sign in as a regular `member`; confirm `/admin/editions` is inaccessible.

## Implementation Notes (as built)

Adaptations made when this feature landed (after its dependent features had already shipped):

- **No `season_editions` table.** That join table was never built (seasons are not scoped per-edition). The delete guard therefore checks **only** `battle_reports.edition_id`, and the list page shows no "Seasons" count column.
- **List counts are Missions / Deployments / Dispositions / Reports.** A "Dispositions" (force dispositions) count replaces the planned "Seasons" count, since force dispositions are edition-scoped and useful to see before deleting.
- **Delete guard is against `battle_reports` only.** `missions`, `deployments`, and `force_dispositions` all use `on delete cascade` and are removed with the edition. `battle_reports.edition_id` is a plain NOT NULL FK, so a referenced edition cannot be deleted — the guard surfaces this with an explicit count.
- **Route protection via middleware.** `/admin/*` is gated for admin + organizer in `src/middleware.ts`; the pages do not re-gate. Server actions independently verify `hasAnyRole(user.id, ['admin', 'organizer'])`.
- **Delete + Set-as-Default live on both the list row actions menu and the edit page** (edit page adds a Danger Zone delete button).

## Notes

- The "Manage Missions" and "Manage Deployments" links in the actions menu point to routes defined in the corresponding feature docs.
- After this feature is complete, the next two features (mission/deployment management) can layer on top without further changes to this UI.
- A future enhancement could allow archiving an edition (hide from selectors but keep referenced data) instead of deleting; deferred until the league has been through enough editions to justify it.
