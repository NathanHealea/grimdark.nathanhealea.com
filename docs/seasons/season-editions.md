# Season Editions Association

**Epic:** Seasons
**Type:** Feature
**Status:** Todo
**Merge Into:** epic/battle-reports

## Summary

Associate every season with one or more Warhammer editions, so that during a transition (e.g., 10th → 11th) the league can let players keep playing the prior edition while new games adopt the new one. Introduce a `season_editions` join table linking seasons and editions, with one entry per season flagged as the default. Backfill existing seasons to allow 10th Edition (default). Update the admin season form to multi-select editions and pick a default. Battle reports created in a season choose one edition from the season's allowed list (see `battle-report-edition.md`).

## Acceptance Criteria

### Data Model

- [ ] A `season_editions` join table exists with `season_id`, `edition_id`, and `is_default` (boolean)
- [ ] Composite primary key on (`season_id`, `edition_id`)
- [ ] Exactly one row per season can have `is_default = true` (enforced via partial unique index)
- [ ] Every season must have at least one edition assigned (enforced via app-level validation; optionally a deferred constraint trigger)
- [ ] Existing seasons are backfilled with a single 10th Edition row marked default
- [ ] Deleting an edition that is referenced by any `season_editions` row is blocked (see `admin-edition-management.md`)

### Admin Season Form

- [ ] The season create/edit form includes a multi-select edition control
- [ ] The control lists only published editions
- [ ] Within the selected editions, the admin picks exactly one as the season's default (radio next to each selected edition, or a separate "default" select)
- [ ] On create, the default edition (`is_default = true` on the editions table) is pre-selected and pre-marked as the season default
- [ ] Validation rejects submissions with zero editions selected or with no default chosen
- [ ] Editing a season's editions is allowed; if removing an edition that has battle reports already submitted under that season + edition combo, show a warning (see Notes)

### Public + Admin Display

- [ ] The public `/seasons` page shows all of a season's editions as badges, with the default edition visually emphasized
- [ ] The admin `/admin/seasons` list page shows the season's editions in a single column (chips/badges)
- [ ] The season edit page shows the current editions and default

## Database

### Migration: `supabase/migrations/XXXXXX_create_season_editions.sql`

```sql
create table public.season_editions (
  season_id  integer not null references public.seasons(id) on delete cascade,
  edition_id integer not null references public.editions(id),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (season_id, edition_id)
);

-- One default edition per season
create unique index season_editions_one_default_per_season
  on public.season_editions (season_id)
  where is_default = true;

-- Backfill: assign 10th Edition to every existing season as the default
insert into public.season_editions (season_id, edition_id, is_default)
select s.id, e.id, true
  from public.seasons s
  cross join public.editions e
 where e.short_name = '10th'
on conflict do nothing;
```

### RLS Policies

```sql
alter table public.season_editions enable row level security;

create policy "Season editions are publicly readable"
  on public.season_editions for select
  to anon, authenticated using (true);

create policy "Admins and organizers can insert season editions"
  on public.season_editions for insert
  to authenticated
  with check (
    'admin'     = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can update season editions"
  on public.season_editions for update
  to authenticated
  using (
    'admin'     = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  )
  with check (
    'admin'     = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );

create policy "Admins and organizers can delete season editions"
  on public.season_editions for delete
  to authenticated
  using (
    'admin'     = any(public.get_user_roles(auth.uid()))
    or 'organizer' = any(public.get_user_roles(auth.uid()))
  );
```

## Implementation

### Key Files

| Action | File                                                       | Description                                                                  |
| ------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Create | `supabase/migrations/XXXXXX_create_season_editions.sql`    | Join table, partial unique index, RLS, backfill                              |
| Modify | `src/types/season.ts`                                      | Add `SeasonEdition` type and helpers (e.g., `getDefaultEditionId(season)`)   |
| Modify | `src/modules/season/queries.ts`                            | Add `getEditionsBySeasonId(seasonId)`; consider returning editions on `getSeasonById` |
| Modify | `src/app/admin/seasons/season-form.tsx`                    | Multi-select editions + default-edition radio                                |
| Modify | `src/app/admin/seasons/actions.ts`                         | Persist `season_editions` rows alongside the season; validate at least one edition + exactly one default |
| Modify | `src/app/admin/seasons/page.tsx`                           | Display edition badges per season                                            |
| Modify | `src/app/seasons/page.tsx`                                 | Display edition badges per season card                                       |

### Type Updates

```ts
// src/types/season.ts
export type SeasonEdition = {
  season_id: number
  edition_id: number
  is_default: boolean
  created_at: string
}

export function getDefaultEditionId(seasonEditions: SeasonEdition[]): number | null {
  return seasonEditions.find((se) => se.is_default)?.edition_id ?? null
}
```

The existing `Season` type does not change. Editions are read separately via `getEditionsBySeasonId(id)` (returns `SeasonEdition[]`) or via a join when needed.

### Server Action Updates

`createSeason` and `updateSeason` accept arrays from the form:

- `editionIds: number[]` — at least one
- `defaultEditionId: number` — must be in `editionIds`

Both actions, in a single transaction:

1. Insert/update the `seasons` row.
2. Replace the season's `season_editions` rows: delete existing rows, insert the new set, marking exactly one as default.

If editing an existing season removes an edition that has associated battle reports (i.e., reports with that `season_id` and `edition_id`), the action returns a recoverable error with a confirmation prompt; resubmitting with an explicit override flag proceeds. The form surfaces this as a warning checkbox.

### Form

Multi-select editions UI:

- Render each published edition as a checkbox/chip
- Beside each checked edition, show a radio button labeled "Default" — only one can be selected across the checked set
- Defaults: pre-check the global default edition; pre-select it as the season default
- On submit, the form sends `editionIds` and `defaultEditionId`

### Display

- Public season card: render edition badges horizontally, default edition visually emphasized (filled vs outlined, or a small star icon)
- Admin season list: render the same badges in a column

## Key Design Decisions

1. **Many-to-many via join table** — Captures the league's transition reality: a season can be running 10th and 11th simultaneously. A foreign key on `seasons` would force a one-edition rule that doesn't match how the league operates during edition rollovers.

2. **Per-season default edition** — When a member submits a battle report under a season, the form needs a sensible default edition without forcing the player to pick. Marking one of the season's editions as default keeps the typical-case form a single click.

3. **At-least-one rule enforced in app, not DB** — Postgres can't easily enforce "at least one row in child table per parent" without deferred constraints. App-level validation in the season server action plus the partial unique index for default keeps the schema simple.

4. **Partial unique index for default** — Same pattern used elsewhere (e.g., `editions.is_default`). Reliable, no triggers needed.

5. **Backfill assigns 10th to every existing season as default** — Preserves all historical data and lets invariants hold (one edition row per season, one default per season). Admins can later add 11th to any existing season if late-season games shift edition.

6. **No automatic mutation of battle reports when editions change on a season** — Removing an edition from a season does not retroactively change the report's `edition_id`. The form warning surfaces this so the admin can decide whether to clean up reports manually.

## Implementation Plan

This feature creates the `season_editions` join table and threads season-edition associations through the admin season form, the public seasons page, and the admin seasons list. It depends on `editions-data-model.md` (the `editions` table and 10th seed). It pairs with `battle-report-edition.md`, which consumes the per-season allowed-editions list to constrain report submissions.

### Step 1 — Migration

Create `supabase/migrations/XXXXXX_create_season_editions.sql` with the SQL from the Database section, in this order:

1. `create table public.season_editions (...)` with composite PK `(season_id, edition_id)`.
2. `create unique index season_editions_one_default_per_season on season_editions (season_id) where is_default = true;` — partial unique index for the default rule, mirrors the `editions.is_default` and `seasons_single_active` patterns.
3. Backfill: insert `(season_id, 10th's edition_id, true)` for every existing season. Use `on conflict do nothing` defensively.
4. `alter table public.season_editions enable row level security;` then create the four policies from the Database section. Use `to anon, authenticated` on the SELECT policy since the public seasons page renders edition badges anonymously.

### Step 2 — Type updates

Modify `src/types/season.ts`:

1. Add `export type SeasonEdition = { season_id: number; edition_id: number; is_default: boolean; created_at: string }`.
2. Add `export function getDefaultEditionId(seasonEditions: SeasonEdition[]): number | null` per the snippet in this doc.

The existing `Season` type is unchanged. The roster types stay in `src/types/season.ts` next to these.

### Step 3 — Query updates

Modify `src/modules/season/queries.ts`:

1. Add `getEditionsBySeasonId(seasonId: number): Promise<SeasonEdition[]>` — `select * from season_editions where season_id = :id`.
2. Add `getSeasonEditionsBatch(seasonIds: number[]): Promise<Map<number, SeasonEdition[]>>` — used by the public list and admin list pages to avoid N+1 queries when rendering edition badges per card. Implementation: one `select * from season_editions where season_id in (...)`, then group client-side into a `Map`.
3. Optionally extend `getSeasonById(id)` to include `season_editions` via a Supabase nested select. Either approach (separate call or nested select) works; pick whichever is simpler at the call site.

### Step 4 — Admin server actions update

Modify `src/app/admin/seasons/actions.ts`:

1. Extend `SeasonFormState`: `editionIds: string`, `defaultEditionId: string` (form-state errors).
2. In `createSeason`:
   - After validating other fields, parse `editionIds = formData.getAll('edition_ids') as string[]` and `defaultEditionId = formData.get('default_edition_id') as string`.
   - Validate at least one edition selected. If empty: `errors.editionIds = 'Select at least one edition.'`.
   - Validate `defaultEditionId` is in `editionIds`: if not, `errors.defaultEditionId = 'Pick which edition is the season default.'`.
   - After the season insert succeeds, build the rows and `insert into season_editions` with `is_default = (id === defaultEditionId)` for each.
   - If the join-table insert fails (rare), best-effort delete the season we just created so the user can retry from a clean state. Surface a generic error.
3. In `updateSeason`:
   - Same validation.
   - After the season update succeeds, replace the season's edition rows: `delete from season_editions where season_id = :id`, then `insert ...` with the new set.
   - **Removed-edition-with-reports warning** — Before the delete, run `select edition_id, count(*) from battle_reports where season_id = :id group by edition_id`. If any of the editions being removed has a non-zero report count, return `errors.editionIds = 'Removing edition X drops N existing battle reports from the season's allowed list. Re-check to confirm.'` unless the form sent an explicit `confirm_remove_editions = 'on'` flag. Once the user re-submits with the confirmation checkbox checked, proceed with the delete.

These actions are not wrapped in a true SQL transaction (server actions don't have one out-of-the-box with Supabase). The two-step pattern (season write, then season_editions write) is acceptable given the partial unique index plus the defensive cleanup on failure.

### Step 5 — Form update

Modify `src/app/admin/seasons/season-form.tsx`:

1. Accept new props: `editions: Edition[]` (published only) and `seasonEditions?: SeasonEdition[]` (current rows when editing).
2. Add a new "Editions" `<fieldset>` between "Format" and "Content":
   - Render each published edition as a checkbox with `name="edition_ids"` and `value={edition.id}`.
   - Each checkbox row also has a radio button with `name="default_edition_id"` and `value={edition.id}`. Disable the radio while the checkbox is unchecked; toggle disabled state via local state on the form.
   - Pre-fill state: when creating, pre-check the global default edition and pre-select its radio. When editing, mirror `seasonEditions`.
3. If editing a season with battle reports under any of its current editions, also render a "Confirm removal" checkbox (`name="confirm_remove_editions"`) that the form server action surfaces only after a first submission triggers the warning. Hide it on the initial render.
4. Surface `state?.errors?.editionIds` and `state?.errors?.defaultEditionId` inline as form errors.

Locally manage the checkbox/radio interaction in React state (a `Set<number>` of selected edition IDs and a `number | null` for the chosen default). When a checkbox is unchecked, also clear the default if it pointed to that edition.

### Step 6 — Form pages pass editions

Modify `src/app/admin/seasons/new/page.tsx` and `src/app/admin/seasons/[id]/edit/page.tsx`:

- Fetch `getPublishedEditions()` from the editions module and pass to `<SeasonForm editions={editions} />`.
- For the edit page, also fetch `getEditionsBySeasonId(season.id)` and pass as `seasonEditions`.

### Step 7 — Display: admin list

Modify `src/app/admin/seasons/page.tsx`:

1. After fetching seasons, also fetch `getSeasonEditionsBatch(seasons.map(s => s.id))` and `getPublishedEditions()` (for name lookup).
2. Add an "Editions" column to the table. Render each season's editions as small badges. The default edition gets `badge-primary`; others get `badge-outline`. Badge label uses `short_name`.

### Step 8 — Display: public list

Modify `src/app/seasons/page.tsx` and the inline `SeasonCard` component:

1. Fetch the same batch and pass through to `SeasonCard` as `editions: SeasonEdition[]` and `editionLookup: Map<number, Edition>`.
2. Inside `SeasonCard`, add a row of edition badges below the title. Default edition is visually emphasized (e.g., filled `badge-primary`); others are `badge-outline`. Order: default first.

The season detail page (`src/app/seasons/[id]/page.tsx`) does not strictly need updating in this feature, but a small "Editions: 10th, 11th (default)" header line is a nice touch — out of scope unless trivial during implementation.

### Affected Files

| Action | File | Description |
| ------ | ---- | ----------- |
| Create | `supabase/migrations/XXXXXX_create_season_editions.sql` | Join table, partial unique index, RLS, backfill |
| Modify | `src/types/season.ts` | Add `SeasonEdition` type and `getDefaultEditionId` helper |
| Modify | `src/modules/season/queries.ts` | Add `getEditionsBySeasonId` and `getSeasonEditionsBatch` |
| Modify | `src/app/admin/seasons/actions.ts` | Validate + persist editions in create/update; warn on edition removal with reports |
| Modify | `src/app/admin/seasons/season-form.tsx` | Multi-select editions + default radio + confirm-remove flow |
| Modify | `src/app/admin/seasons/new/page.tsx` | Pass editions list |
| Modify | `src/app/admin/seasons/[id]/edit/page.tsx` | Pass editions list and current season editions |
| Modify | `src/app/admin/seasons/page.tsx` | Render edition badges per row |
| Modify | `src/app/seasons/page.tsx` | Render edition badges per public card |

### Risks & Considerations

| Risk | Mitigation |
| ---- | ---------- |
| Backfill misses seasons because 10th wasn't seeded | Hard depends on `editions-data-model.md`. Verify `select * from season_editions` after the migration shows one row per existing season. |
| Two admins edit the same season's editions concurrently | The replace-then-insert pattern in `updateSeason` is last-writer-wins on the join rows. Acceptable for low-frequency admin work. |
| Form's checkbox/radio state gets out of sync with the server | Manage both in a single React state object; derive `defaultEditionId` from `selectedIds` whenever the user unchecks a previously-default edition. |
| `defaultEditionId` reaches the server pointing at an unselected edition | Server action revalidates that the chosen default is in the `editionIds` array; rejects with a field error if not. |
| Removing an edition silently drops battle reports from the "allowed" set | Two-step warning flow forces the admin to acknowledge. The reports themselves are not modified. |
| Public read policy `using (true)` exposes draft seasons' edition associations | Acceptable — drafts are already filtered out of the public seasons page itself, so the join-table rows are unreachable through the UI even if technically readable. If stricter behavior is needed, narrow the SELECT policy to `exists (select 1 from seasons s where s.id = season_editions.season_id and s.status = 'published')`. |
| Composite PK + on conflict do nothing on backfill | If a season was already manually pre-populated, the conflict skips it cleanly. |
| Public seasons list has many seasons → batch query gets large | `select ... where season_id in (...)` on a small (< 100 row) set is fine. If the list grows, consider per-card lazy fetch — out of scope. |

### Testing

Manual verification:

1. Apply migration. `select count(*) from season_editions` matches `count(*) from seasons`.
2. Sign in as admin. Visit `/admin/seasons` — each row shows a "10th" badge (default styling).
3. Visit `/seasons` (signed out) — public cards show the same.
4. Edit an existing season; the editions fieldset shows 10th checked + default-radio selected.
5. Add 11th; pick 11th as default; save. Verify both badges appear; 11th is now the emphasized one.
6. Submit a battle report for that season under 11th (depends on `battle-report-edition.md`), then re-edit the season and remove 11th — verify the warning appears and a confirm checkbox is required.
7. Try saving a season with zero editions — rejected with field error.
8. Try saving with two checked editions but neither marked default — rejected.

## Notes

- `season-information.md` and `season-roster.md` remain unchanged — neither cares about edition.
- The standings/leaderboard page already filters by `season_id`. After this feature lands, it can additionally filter by edition within the season (e.g., "Show 10th Edition standings for Season 3").
- Future enhancement: per-season per-edition rosters or roster sub-grouping. Deferred — not requested.
- This feature depends on `editions-data-model.md` being applied first (10th must exist before backfill).
