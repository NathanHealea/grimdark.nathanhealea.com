# Factions Data Model

**Epic:** Factions

## Summary

Create a `factions` reference table containing all official Warhammer 40k factions, and a `profile_factions` join table linking users to their selected factions. Seed the database with the full list of official factions via a migration.

## Data Model

### `factions` table

| Column       | Type        | Constraints                     |
| ------------ | ----------- | ------------------------------- |
| `id`         | UUID        | PK, default `gen_random_uuid()` |
| `name`       | TEXT        | NOT NULL, UNIQUE                |
| `created_at` | TIMESTAMPTZ | default `now()`                 |

### `profile_factions` join table

| Column       | Type | Constraints                   |
| ------------ | ---- | ----------------------------- |
| `profile_id` | UUID | FK to `profiles.id`, NOT NULL |
| `faction_id` | UUID | FK to `factions.id`, NOT NULL |

Composite primary key on (`profile_id`, `faction_id`).

### Seed data

The migration seeds all official Warhammer 40k factions:

Adepta Sororitas, Adeptus Custodes, Adeptus Mechanicus, Aeldari, Astra Militarum, Black Templars, Blood Angels, Chaos Daemons, Chaos Knights, Chaos Space Marines, Dark Angels, Death Guard, Deathwatch, Drukhari, Genestealer Cults, Grey Knights, Imperial Knights, Leagues of Votann, Necrons, Orks, Space Marines, Space Wolves, T'au Empire, Thousand Sons, Tyranids, World Eaters

### Row-Level Security

- **`factions`**: Authenticated users can SELECT. No INSERT/UPDATE/DELETE (admin-only, future feature).
- **`profile_factions`**: Authenticated users can SELECT any row. Users can INSERT/DELETE only their own rows (where `profile_id` matches `auth.uid()`).

## Future enhancements

- Admin CRUD for managing factions (add, edit, remove)

## Acceptance Criteria

- [ ] `factions` table exists with `id`, `name`, and `created_at` columns
- [ ] `profile_factions` join table exists with composite PK on (`profile_id`, `faction_id`)
- [ ] Migration seeds all official Warhammer 40k factions listed above
- [ ] RLS policies allow authenticated users to read factions
- [ ] RLS policies allow users to manage only their own profile-faction associations
- [ ] TypeScript types are defined for `Faction` and `ProfileFaction`
