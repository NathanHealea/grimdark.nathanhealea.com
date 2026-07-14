# Season Information

**Epic:** Seasons
**Type:** Feature
**Status:** In Progress

## Summary

Provide a season system that organizes league play into time-bounded periods. Each season has a name, date range, battle size, optional rules, and an active/inactive status. Battle reports are automatically assigned to a season based on their event date. Admins manage seasons through the admin panel. A public seasons page displays the current and past seasons.

## Acceptance Criteria

### Data Model

- [x] A `seasons` table exists with name, start/end dates, battle size, description, and active status
- [x] Each season references a `battle_points` row for its battle size
- [ ] Only one season can be active at a time (enforced at the database level)
- [x] Seasons table has RLS policies: public read, admin-only insert/update/delete

### Battle Report Assignment

- [ ] Battle reports are automatically assigned to the active season when created
- [x] A `season_id` column on `battle_reports` stores the assignment (nullable for reports created when no season is active)
- [ ] Assignment happens via a database trigger on insert of battle reports
- [x] Existing battle reports can be backfilled by admins when a season is created

### Admin Management

- [x] Admins can create a new season from the admin panel
- [x] Admins can edit an existing season (name, dates, battle size, description, active status)
- [ ] Admins can deactivate a season (but not delete — historical data is preserved)
- [x] Season management page is accessible at `/admin/seasons`
- [ ] Setting a season as active automatically deactivates the previously active season

### Public Display

- [x] A public `/seasons` page shows the current active season prominently
- [x] Past seasons are listed below in reverse chronological order
- [x] Each season card shows: name, date range, battle size, and description
- [x] The page is accessible without authentication
- [x] A "Seasons" link appears in the public navbar

## Routes

| Route | Description |
|---|---|
| `/seasons` | Public page listing current and past seasons |
| `/admin/seasons` | Admin page for creating and managing seasons |

## Database

### Migration: `supabase/migrations/XXXXXX_create_seasons_table.sql`

Creates the `seasons` table and adds `season_id` to `battle_reports`.

#### `seasons` Table

| Column | Type | Constraints |
|---|---|---|
| `id` | `serial` | Primary key |
| `name` | `text` | Not null |
| `start_date` | `date` | Not null |
| `end_date` | `date` | Not null |
| `battle_points_id` | `int` | FK -> `battle_points(id)`, not null |
| `description` | `text` | Nullable |
| `is_active` | `boolean` | Not null, default false |
| `created_at` | `timestamptz` | Not null, default `now()` |
| `updated_at` | `timestamptz` | Not null, default `now()` |

**Constraints:**
- `end_date > start_date` (check constraint)
- Unique partial index on `is_active` where `is_active = true` (enforces only one active season)
- `updated_at` trigger reuses existing `handle_updated_at()` function

#### `battle_reports` Changes

- Add `season_id int references seasons(id)` (nullable — reports may fall outside any season)

#### Trigger: Auto-Assign Active Season

A `BEFORE INSERT` trigger on `battle_reports` that assigns the currently active season:

```sql
create or replace function public.assign_battle_report_season()
returns trigger as $$
begin
  select id into new.season_id
    from public.seasons
   where is_active = true
   limit 1;
  return new;
end;
$$ language plpgsql;
```

This assigns whatever season is active at the time the report is created, regardless of the report's `event_date`. If no season is active, `season_id` remains null.

### RLS Policies

- **SELECT:** Public — `anon` and `authenticated` can read all seasons
- **INSERT:** Admins only
- **UPDATE:** Admins only
- **DELETE:** No delete policy — seasons are deactivated, not deleted

## Implementation

### Key Files

| Action | File | Description |
|---|---|---|
| Create | `supabase/migrations/20260220210000_create_seasons_table.sql` | Seasons table, battle_reports season_id, trigger, RLS |
| Create | `src/types/season.ts` | `Season` type definition |
| Create | `src/modules/season/queries.ts` | `getSeasons()`, `getActiveSeason()`, `getSeasonById()` |
| Create | `src/app/seasons/page.tsx` | Public seasons page |
| Create | `src/app/admin/seasons/page.tsx` | Admin season management page |
| Create | `src/app/admin/seasons/season-form.tsx` | Client form for create/edit season |
| Create | `src/app/admin/seasons/actions.ts` | `createSeason`, `updateSeason` server actions |
| Modify | `src/routes.ts` | Add "Seasons" to `publicLinks` and `adminLinks` |
| Modify | `src/middleware.ts` | Add `/seasons` to `PUBLIC_ROUTES` |

### Approach

#### 1. Database Migration

Create the `seasons` table, add `season_id` to `battle_reports`, create the auto-assign trigger, and set up RLS policies. The trigger assigns the active season on insert — no application code needed for assignment logic.

#### 2. Type Definition

```ts
// src/types/season.ts
export type Season = {
  id: number
  name: string
  start_date: string
  end_date: string
  battle_points_id: number
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
```

#### 3. Season Queries Module

Server-side query functions in `src/modules/season/queries.ts`:
- `getSeasons()` — all seasons ordered by `start_date` descending
- `getActiveSeason()` — the single active season (or null)
- `getSeasonById(id)` — fetch a single season for the edit form

#### 4. Public Seasons Page

Server component at `/seasons` that:
- Fetches all seasons and battle points in parallel
- Displays the active season in a highlighted card at the top
- Lists past/inactive seasons below in reverse chronological order
- Each card shows name, date range (formatted), battle size name, and description
- Publicly accessible — added to `PUBLIC_ROUTES` in middleware and `publicLinks` in routes

#### 5. Admin Season Management

Admin page at `/admin/seasons` (protected by existing admin layout):
- Lists all seasons in a table with name, dates, battle size, status, and edit action
- "Create Season" button opens a form
- Edit action navigates to the form pre-filled with season data

Season form (`season-form.tsx`):
- Fields: name (text), start date (date input), end date (date input), battle size (select from `battle_points`), description (textarea), active (checkbox)
- Submits to `createSeason` or `updateSeason` server action
- Server action validates inputs, checks `end_date > start_date`
- When setting `is_active = true`, the action first deactivates any currently active season (single SQL update) before saving

#### 6. Backfill Existing Reports

The `createSeason` server action optionally backfills existing battle reports whose `event_date` falls within the new season's date range:

```sql
update public.battle_reports
   set season_id = :new_season_id
 where event_date between :start_date and :end_date
   and season_id is null;
```

This is triggered explicitly by the admin, not automatically, to avoid unintended reassignment of reports already assigned to another season.

## Key Design Decisions

1. **Auto-assign active season on insert** — When a battle report is created, it is automatically assigned to whatever season is currently active via a `BEFORE INSERT` trigger. This keeps the submission form unchanged and requires no user input about seasons. If no season is active, the report gets `season_id = null`.

2. **Nullable `season_id`** — Reports created when no season is active have `season_id = null`. This avoids forcing all reports into a season and handles edge cases (games before the first season, between seasons, etc.).

3. **Single active season constraint** — A unique partial index on `is_active WHERE is_active = true` enforces at the database level that only one season can be active. The admin action deactivates the current season before activating a new one.

4. **No delete, only deactivate** — Seasons are never deleted to preserve historical data integrity. Battle reports reference seasons by ID, so deleting a season would break those references.

5. **Reuse `battle_points` for battle size** — Seasons reference the existing `battle_points` table rather than duplicating point values. This keeps the data normalized and means battle size options are always consistent between seasons and battle reports.

6. **Admin backfill for existing reports** — When an admin creates a season, they can optionally backfill existing battle reports within that date range. This handles the bootstrap case where reports exist before the season system. Backfill is explicit, not automatic, to avoid unintended reassignment.

## Notes

- The standings/leaderboard feature (planned) will filter by `season_id` — this migration lays the groundwork for that.
- The active season will be referenced on the landing page and potentially in the battle report form (to show which season a new report falls into).
- Season date ranges should not overlap — this could be enforced via an exclusion constraint or validated in the server action. Start with server-action validation for simplicity.
