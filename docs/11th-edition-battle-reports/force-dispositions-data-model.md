# Force Dispositions Data Model

**Epic:** 11th Edition Battle Reports
**Type:** Feature
**Status:** Done
**Branch:** feature/force-dispositions-data-model
**Merge Into:** epic/11th-edition-battle-reports

## Summary

Introduce a `force_dispositions` table capturing the five 11th edition Force Dispositions (Take and Hold, Purge the Foe, Reconnaissance, Priority Assets, Disruption), scoped to an edition, plus the mission↔disposition mapping that models the 11th edition 5×5 matchup matrix: each primary mission belongs to a disposition's deck and is played against a specific opponent disposition. This is the schema foundation the rest of the epic builds on. 10th edition is untouched — it simply has no disposition rows, and its missions carry null mapping columns.

## Acceptance Criteria

- [x] A `force_dispositions` table exists with id, edition_id, name, description, and timestamps
- [x] Disposition names are unique per edition
- [x] RLS mirrors the missions pattern: publicly readable, admins/organizers can insert/update/delete
- [x] The migration seeds the five 11th edition Force Dispositions (with their deck themes as descriptions)
- [x] `missions` gains nullable `force_disposition_id` (the deck the mission belongs to) and `opponent_force_disposition_id` (the opponent disposition it is scored against)
- [x] A mission has either both mapping columns set or neither (check constraint) — all existing 10th edition missions remain unmapped
- [x] At most one mission exists per (edition, disposition, opponent disposition) triple (partial unique index)
- [x] `ForceDisposition` type and query module exist following the edition/mission module patterns
- [x] `Mission` type includes the two new nullable fields and mission queries select them

## Database

### Migration: `supabase/migrations/XXXXXX_create_force_dispositions.sql`

#### `force_dispositions` Table

| Column        | Type          | Constraints                                              |
| ------------- | ------------- | -------------------------------------------------------- |
| `id`          | `serial`      | Primary key                                              |
| `edition_id`  | `integer`     | Not null, references `editions(id)` on delete cascade    |
| `name`        | `text`        | Not null                                                 |
| `description` | `text`        | Nullable (deck theme, e.g. "Hold objectives…")           |
| `created_at`  | `timestamptz` | Not null, default `now()`                                |
| `updated_at`  | `timestamptz` | Not null, default `now()`                                |

**Constraints:**

- Unique `(edition_id, name)` — mirrors `missions_edition_name_unique`
- `updated_at` trigger reuses `handle_updated_at()`

#### `missions` mapping columns

```sql
alter table public.missions
  add column force_disposition_id integer references public.force_dispositions(id) on delete restrict,
  add column opponent_force_disposition_id integer references public.force_dispositions(id) on delete restrict;

alter table public.missions
  add constraint missions_disposition_both_or_neither
  check ((force_disposition_id is null) = (opponent_force_disposition_id is null));

create unique index missions_disposition_pairing_unique
  on public.missions (edition_id, force_disposition_id, opponent_force_disposition_id)
  where force_disposition_id is not null;
```

`on delete restrict` (rather than cascade) so deleting a disposition that still maps missions fails loudly; the admin delete guard (see `admin-force-dispositions.md`) gives the friendly error first.

#### Seed

Insert the five dispositions for the 11th Edition row seeded by `20260508000000_create_editions_table.sql` (look up by `short_name = '11th'`):

Take and Hold, Purge the Foe, Reconnaissance, Priority Assets, Disruption — descriptions from the deck themes in `docs/editions/11th-edition-mission-data.md` (Force Dispositions section).

### RLS Policies

Mirror the edition-aware missions policies from `20260509000000_add_edition_to_missions.sql`:

- **SELECT:** Publicly readable
- **INSERT / UPDATE / DELETE:** Admins and organizers only (`public.get_user_roles(auth.uid())`)

## Implementation

### Key Files

| Action | File | Description |
|---|---|---|
| Create | `supabase/migrations/XXXXXX_create_force_dispositions.sql` | Table, mission mapping columns, RLS, seed |
| Create | `src/types/force-disposition.ts` | `ForceDisposition` type |
| Modify | `src/types/battle-report.ts` | Add `force_disposition_id` / `opponent_force_disposition_id` to `Mission` (line 57) |
| Create | `src/modules/force-disposition/queries.ts` | `getForceDispositionsByEditionId`, `getForceDispositionById` |
| Modify | `src/modules/battle-report/queries.ts` | Select the new mission columns in `getMissionsByEditionId` / `getAllMissions` / `getMissionById` |

### Approach

#### 1. Migration

Create the table, constraints, RLS, and seed in one migration (next timestamp after `20260517000000`). Add the mission mapping columns in the same migration — they are meaningless without the table and nothing references them yet.

#### 2. Types

```ts
// src/types/force-disposition.ts
export type ForceDisposition = {
  id: number
  edition_id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
}
```

Extend `Mission` in `src/types/battle-report.ts`:

```ts
export type Mission = {
  id: number
  name: string
  edition_id: number
  force_disposition_id: number | null
  opponent_force_disposition_id: number | null
}
```

#### 3. Queries module

`src/modules/force-disposition/queries.ts` modeled on `src/modules/edition/queries.ts`: `await createClient()` from `@/lib/supabase/server`, `console.error` + `[]`/`null` on failure.

- `getForceDispositionsByEditionId(editionId)` — ordered by `name`
- `getForceDispositionById(id)`

## Key Design Decisions

1. **Missions carry the matchup mapping** — The 5×5 matrix says "your disposition (deck) vs opponent's disposition → the primary mission you score". Modeling this as two FK columns on `missions` reuses the existing edition-scoped missions table (and its admin UI, delete guards, and battle-report integrity trigger) instead of introducing a separate matrix table. A mission with mappings *is* a matrix cell.

2. **Both-or-neither check constraint** — A mission is either a classic mission (10th) or a disposition-deck mission (11th). Half-mapped rows are never valid.

3. **Disposition presence drives edition behavior** — Downstream features detect "this edition uses dispositions" by `getForceDispositionsByEditionId(editionId).length > 0`, not by hardcoding the 11th edition id. A future 12th edition works either way with zero code changes.

4. **`on delete restrict` on mapping FKs** — Deleting a disposition with mapped missions is a data-integrity event; it must fail at the DB level even if the admin-UI guard is bypassed.

5. **Dispositions are edition-scoped, not global** — Same reasoning as missions/deployments: a future edition may rename or replace dispositions, and per-edition rows keep history intact.

## Notes

- Depends on the editions infrastructure already on the epic branch (`20260508000000_create_editions_table.sql`, `20260509000000_add_edition_to_missions.sql`).
- Seed data for the 25 mapped missions lands in `11th-edition-data-seed.md`, not here — this feature only creates the five disposition rows and the empty mapping columns.
- No automated tests: the project has no test conventions (no `## Testing` in CLAUDE.md, no test files). Verify manually: apply migration, confirm five 11th rows, confirm the check constraint rejects a half-mapped mission, confirm `npm run build` passes.
