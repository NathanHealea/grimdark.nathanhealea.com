# Editions Data Model

**Epic:** Editions
**Type:** Feature
**Status:** In Progress
**Merge Into:** epic/battle-reports

## Summary

Introduce an `editions` table that captures each Warhammer rules edition (10th, 11th, and any future edition) the league plays under. Editions are the foundational reference for edition-scoped missions and deployments, and are referenced by seasons and battle reports. One edition is flagged as the default and is used to pre-fill new seasons and reports. Existing data is backfilled to 10th Edition so historical seasons and battle reports remain valid.

## Acceptance Criteria

### Data Model

- [x] An `editions` table exists with id, name, short_name, description, status (draft/published), is_default, and timestamps
- [x] At most one edition can have `is_default = true` (enforced at the database level via partial unique index)
- [x] `short_name` is unique (e.g., `10th`, `11th`)
- [x] Editions have a draft/published status mirroring the seasons pattern
- [x] RLS: published editions are publicly readable; admins (and organizers, mirroring seasons) can insert/update/delete; drafts are visible only to admins/organizers

### Seed Data

- [x] Migration seeds **10th Edition** as published and `is_default = true`
- [x] Migration seeds **11th Edition** as published, `is_default = false`, with no missions or deployments yet (admin populates)

### Backfill of Existing Data

- [x] All existing `missions` rows are reassigned to 10th Edition
- [x] All existing `deployments` rows are reassigned to 10th Edition
- [ ] All existing seasons receive a `season_editions` row pointing to 10th Edition (marked default) — see `season-editions.md`
- [x] All existing `battle_reports` rows are reassigned to 10th Edition
- [x] After backfill, the `edition_id` columns on missions / deployments / battle_reports can be set to NOT NULL (where appropriate per their feature docs)

## Database

### Migration: `supabase/migrations/XXXXXX_create_editions_table.sql`

#### `editions` Table

| Column        | Type          | Constraints                                           |
| ------------- | ------------- | ----------------------------------------------------- |
| `id`          | `serial`      | Primary key                                           |
| `name`        | `text`        | Not null (e.g., "10th Edition")                       |
| `short_name`  | `text`        | Not null, unique (e.g., "10th")                       |
| `description` | `text`        | Nullable                                              |
| `status`      | `text`        | Not null, check in (`'draft'`, `'published'`), default `'draft'` |
| `is_default`  | `boolean`     | Not null, default `false`                             |
| `created_at`  | `timestamptz` | Not null, default `now()`                             |
| `updated_at`  | `timestamptz` | Not null, default `now()`                             |

**Constraints:**

- Partial unique index `unique (is_default) where is_default = true` — only one default edition at a time
- `updated_at` trigger reuses existing `handle_updated_at()` function

#### Seed

```sql
insert into public.editions (name, short_name, description, status, is_default) values
  ('10th Edition', '10th', 'Warhammer 40,000 10th Edition', 'published', true),
  ('11th Edition', '11th', 'Warhammer 40,000 11th Edition', 'published', false);
```

### RLS Policies

Mirrors the existing seasons policies:

- **SELECT:** Anyone can read editions where `status = 'published'`. Admins and organizers can read all (including drafts).
- **INSERT / UPDATE / DELETE:** Admins and organizers only.

## Implementation

### Key Files

| Action | File                                                               | Description                                                |
| ------ | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| Create | `supabase/migrations/XXXXXX_create_editions_table.sql`             | `editions` table, partial unique index, RLS, seed data     |
| Create | `src/types/edition.ts`                                             | `Edition` type definition + helpers                        |
| Create | `src/modules/edition/queries.ts`                                   | `getEditions()`, `getPublishedEditions()`, `getDefaultEdition()`, `getEditionById()` |

### Type Definition

```ts
// src/types/edition.ts
export type EditionStatus = 'draft' | 'published'

export type Edition = {
  id: number
  name: string
  short_name: string
  description: string | null
  status: EditionStatus
  is_default: boolean
  created_at: string
  updated_at: string
}
```

### Queries Module

Server-side query functions in `src/modules/edition/queries.ts`:

- `getEditions()` — all editions ordered by `id` ascending (admin/organizer view)
- `getPublishedEditions()` — only published editions, used by member-facing forms
- `getDefaultEdition()` — the single default edition (or null)
- `getEditionById(id)` — fetch a single edition for the edit form

## Key Design Decisions

1. **Single default edition via partial unique index** — Reuses the same constraint pattern previously used for an active season. The admin "set default" action deactivates the current default before activating a new one.

2. **Draft/Published status** — Mirrors seasons. Lets admins prepare an upcoming edition (e.g., 12th) with its own missions and deployments before exposing it to members.

3. **Backfill all existing data to 10th** — Avoids null `edition_id` fan-out across missions, deployments, seasons, and battle reports. After backfill, downstream features can require non-null `edition_id`.

4. **Short name as a stable key** — `short_name` ("10th", "11th") is unique and used as a compact label in UI (chips, badges) and potentially in URLs. The full `name` is used in long-form contexts.

5. **No hard delete in this feature** — Delete behavior is defined in the admin management feature; this doc just establishes the schema and seed.

## Implementation Plan

This feature is the foundational schema work for the Editions epic. It must land before any of the dependent docs (`edition-missions-management.md`, `edition-deployments-management.md`, `season-editions.md`, `battle-report-edition.md`) because they all add `edition_id` references and rely on 10th Edition existing in the seed.

### Step 1 — Create the migration file

Create `supabase/migrations/XXXXXX_create_editions_table.sql` (use the next timestamp prefix consistent with the existing convention, e.g., `20260314000000_`). The migration must be self-contained and run in this order:

1. `create table public.editions (...)` with the columns and constraints from the Database section above.
2. Add a `check` constraint on `status in ('draft', 'published')`.
3. Create the partial unique index `editions_single_default on public.editions (is_default) where is_default = true`. This mirrors the `seasons_single_active` pattern in `20260220210000_create_seasons_table.sql`.
4. Create a unique index on `short_name`.
5. Attach the existing `handle_updated_at()` trigger as `on_editions_updated`.
6. `alter table public.editions enable row level security;` then create the four RLS policies (see Step 2).
7. Insert the seed rows for 10th (default, published) and 11th (non-default, published).

Do **not** add `edition_id` columns to `missions`, `deployments`, `battle_reports`, or `seasons` in this migration — those belong to their respective feature docs. Backfill of those columns is also deferred to those migrations, since the columns don't exist yet.

### Step 2 — RLS policies

Mirror the seasons pattern from `20260225204939_add_season_status.sql` plus the organizer extensions from `20260227230005_allow_organizer_on_seasons.sql`:

1. `Published editions are publicly readable` — `for select using (status = 'published')`.
2. `Admins and organizers can view all editions` — `for select` gated on `'admin' = any(public.get_user_roles(auth.uid())) or 'organizer' = any(public.get_user_roles(auth.uid()))`.
3. `Admins and organizers can insert editions` — `for insert with check (...)` using the same role check.
4. `Admins and organizers can update editions` — `for update using (...) with check (...)`.
5. `Admins and organizers can delete editions` — `for delete using (...)`. (Hard delete behavior is owned by `admin-edition-management.md`; this policy just unblocks it.)

Use `public.get_user_roles(auth.uid())` rather than the explicit `user_roles`/`roles` join — it's the newer pattern and is what `create_battle_reports.sql` already uses.

### Step 3 — Type definition

Create `src/types/edition.ts` matching the shape in the doc above:

- `EditionStatus = 'draft' | 'published'`.
- `Edition` type with all eight columns.
- A `formatEditionLabel(edition)` helper that returns `short_name` for compact contexts is optional, but mirroring `formatSeasonName` in `src/types/season.ts` is a useful precedent if other docs in the epic need it.

### Step 4 — Queries module

Create `src/modules/edition/queries.ts` modeled on `src/modules/season/queries.ts`:

- `getEditions({ includeAll = false } = {})` — returns all editions ordered by `id` ascending. When `includeAll = false`, filter to `status = 'published'`. (Match the seasons pattern of a single function with a flag rather than two separate functions.)
- `getPublishedEditions()` — thin wrapper over `getEditions({ includeAll: false })`, kept for readability at call sites.
- `getDefaultEdition()` — single row where `is_default = true`. Use `.maybeSingle()` (or handle `PGRST116` like `getCurrentSeason` does) so a missing row returns `null` instead of throwing.
- `getEditionById(id: number)` — single row for the edit form; admin-only callers get drafts implicitly via RLS.

All functions use `await createClient()` from `@/lib/supabase/server` — same pattern as the seasons module. Log errors with `console.error` and return `[]` / `null` on failure.

### Step 5 — Verify locally

1. Run the migration against a local Supabase instance and confirm the seed inserts both editions.
2. Confirm `select * from editions` returns 10th (is_default true) and 11th (is_default false) when authenticated as anon, since both are published.
3. Try inserting a second `is_default = true` row manually and confirm the partial unique index rejects it.
4. Run `npm run build` (or `next build`) to confirm the new `Edition` type and queries module compile cleanly.

### Affected Files

| Action | File | Description |
| ------ | ---- | ----------- |
| Create | `supabase/migrations/XXXXXX_create_editions_table.sql` | `editions` table, indexes, trigger, RLS policies, seed |
| Create | `src/types/edition.ts` | `Edition` type, `EditionStatus` union |
| Create | `src/modules/edition/queries.ts` | `getEditions`, `getPublishedEditions`, `getDefaultEdition`, `getEditionById` |

No existing files are modified by this feature. The dependent epic docs handle their own column additions and backfills.

### Risks & Considerations

| Risk | Mitigation |
| ---- | ---------- |
| Migration timestamp collision with another in-flight branch | Use the next available timestamp at merge time; rename the file before pushing if a newer migration has already landed. |
| Partial unique index syntax differs slightly across Postgres versions | Pattern is already in use in `seasons_single_active` — copy it verbatim. |
| Forgetting to seed 10th as default breaks every dependent backfill | The seed is part of this same migration; the `is_default = true` flag is non-negotiable for 10th. Verify in Step 5. |
| Organizer role didn't exist when the seasons table was first created | The organizer role exists as of `20260227202147_add_organizer_role.sql`, which is well before this migration runs, so policies referencing `'organizer'` will resolve. |
| Future editions need to flip the default | Out of scope for this feature; covered by `admin-edition-management.md`. The partial unique index already enforces single-default at write time. |
| Hard-deleting an edition that's referenced elsewhere | Foreign keys are added by dependent migrations, not this one. This feature does not need referential-integrity guards yet. |

### Testing

No `## Testing` section exists in the project's CLAUDE.md and there are no `*.test.*` / `*.spec.*` files in the repo, so automated unit tests are not part of this project's conventions. Verification is manual per Step 5.

## Notes

- Subsequent feature docs (`edition-missions-management.md`, `edition-deployments-management.md`, `season-editions.md`, `battle-report-edition.md`) depend on this migration being applied first — they each add `edition_id` references and rely on 10th Edition existing for backfill.
- The migration order matters: create `editions` and seed 10th/11th, *then* run the backfill steps in the dependent feature migrations.
