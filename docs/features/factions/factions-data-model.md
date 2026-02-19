# Factions Data Model

**Epic:** Factions
**Status:** Completed

## Summary

Create a `factions` reference table containing all official Warhammer 40k factions with support for hierarchical sub-factions (unlimited depth via self-referencing `parent_id`), and a `profile_factions` join table linking users to their selected factions. Seed the database with the full faction tree via a migration.

## Data Model

### `factions` table

| Column       | Type        | Constraints                                       |
| ------------ | ----------- | ------------------------------------------------- |
| `id`         | UUID        | PK, default `gen_random_uuid()`                   |
| `parent_id`  | UUID        | FK to `factions.id`, nullable (null = root faction)|
| `name`       | TEXT        | NOT NULL                                          |
| `created_at` | TIMESTAMPTZ | default `now()`                                   |

Unique constraint on (`parent_id`, `name`) — faction names must be unique within the same parent. Root factions (where `parent_id` is null) use a unique index on `name` where `parent_id is null`.

### `profile_factions` join table

| Column       | Type | Constraints                   |
| ------------ | ---- | ----------------------------- |
| `profile_id` | UUID | FK to `profiles.id`, NOT NULL |
| `faction_id` | UUID | FK to `factions.id`, NOT NULL |

Composite primary key on (`profile_id`, `faction_id`).

### Seed data

The migration seeds the official Warhammer 40k faction hierarchy:

**Imperium** (root)
- Adepta Sororitas
- Adeptus Custodes
- Adeptus Mechanicus
- Astra Militarum
- Grey Knights
- Imperial Knights
- Space Marines
  - Black Templars
  - Blood Angels
  - Dark Angels
  - Deathwatch
  - Space Wolves

**Chaos** (root)
- Chaos Daemons
- Chaos Knights
- Chaos Space Marines
- Death Guard
- Thousand Sons
- World Eaters

**Xenos** (root)
- Aeldari
- Drukhari
- Genestealer Cults
- Leagues of Votann
- Necrons
- Orks
- T'au Empire
- Tyranids

### Row-Level Security

- **`factions`**: Authenticated users can SELECT. No INSERT/UPDATE/DELETE (admin-only, future feature).
- **`profile_factions`**: Authenticated users can SELECT any row. Users can INSERT/DELETE only their own rows (where `profile_id` matches `auth.uid()`).

## Implementation Details

### Hierarchy Queries

To fetch a faction with its children:
```sql
select * from factions where parent_id = :faction_id;
```

To fetch the full tree for display (all factions ordered for tree rendering):
```sql
with recursive faction_tree as (
  select id, parent_id, name, 0 as depth
  from factions where parent_id is null
  union all
  select f.id, f.parent_id, f.name, ft.depth + 1
  from factions f
  join faction_tree ft on f.parent_id = ft.id
)
select * from faction_tree order by depth, name;
```

### TypeScript Types

```ts
// src/types/faction.ts
export type Faction = {
  id: string
  parent_id: string | null
  name: string
  created_at: string
}

export type ProfileFaction = {
  profile_id: string
  faction_id: string
}
```

## Future Enhancements

- Admin CRUD for managing factions (add, edit, remove)

## Acceptance Criteria

- [x] `factions` table exists with `id`, `parent_id`, `name`, and `created_at` columns
- [x] `parent_id` self-references `factions.id` allowing unlimited nesting depth
- [x] `profile_factions` join table exists with composite PK on (`profile_id`, `faction_id`)
- [x] Migration seeds the full faction hierarchy (Imperium, Chaos, Xenos roots with children)
- [x] RLS policies allow authenticated users to read factions
- [x] RLS policies allow users to manage only their own profile-faction associations
- [x] TypeScript types are defined for `Faction` and `ProfileFaction`
