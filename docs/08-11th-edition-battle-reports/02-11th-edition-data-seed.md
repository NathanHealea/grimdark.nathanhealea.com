# 11th Edition Data Seed

**Epic:** 11th Edition Battle Reports
**Type:** Feature
**Status:** Completed
**Branch:** feature/11th-edition-data-seed
**Merge Into:** epic/11th-edition-battle-reports

## Summary

Seed the 11th edition's playable reference data from `docs/04-editions/05-11th-edition-mission-data.md`: the six deployments and the twenty-five primary missions, each mission mapped to its Force Disposition deck and opponent disposition. After this migration, the edition-aware battle report form has real 11th edition options and the admin pages show the full catalog.

## Acceptance Criteria

- [x] The six 11th edition deployments exist in `deployments` with `edition_id` = 11th
- [x] The twenty-five primary missions exist in `missions` with `edition_id` = 11th and both disposition mapping columns set
- [x] The mission mappings reproduce the 5×5 matrix exactly (5 mirrors + 20 asymmetric cells)
- [x] Re-running the migration against a database where an admin already hand-entered some of these rows does not fail or duplicate (idempotent inserts)
- [x] 10th edition data is untouched

## Database

### Migration: `supabase/migrations/XXXXXX_seed_11th_edition_data.sql`

All inserts resolve ids by name at runtime (`select id from editions where short_name = '11th'`, `select id from force_dispositions where name = ... and edition_id = ...`) — never hardcode serial ids. Use `on conflict do nothing` against the existing unique indexes (`deployments_edition_name_unique`, `missions_edition_name_unique`) so the migration is safe if an admin pre-entered rows via the admin UI.

#### Deployments (6)

Crucible of Battle, Dawn of War, Hammer and Anvil, Search and Destroy, Sweeping Engagement, Tipping Point.

#### Missions (25) — deck × opponent disposition matrix

Read: the mission belongs to the **row** disposition's deck and is scored against the **column** opponent disposition.

| Deck \ vs Opponent | Take and Hold | Purge the Foe | Reconnaissance | Priority Assets | Disruption |
|---|---|---|---|---|---|
| **Take and Hold** | Battlefield Dominance | Immovable Object | Purge and Secure | Inescapable Dominion | Determined Acquisition |
| **Purge the Foe** | Unstoppable Force | Meatgrinder | Consecrate | Destroyer's Wrath | Punishment |
| **Reconnaissance** | Reconnaissance Sweep | Triangulation | Gather Intel | Search and Scour | Surveil the Foe |
| **Priority Assets** | Secure Asset | Vital Link | Vanguard Operation | Sabotage | Extract Relic |
| **Disruption** | Death Trap | Delaying Action | Smoke and Mirrors | Locate and Deny | Outmanoeuvre |

Source: `docs/04-editions/05-11th-edition-mission-data.md` (Combinations / Pairings — transcribed from gdmissions.app/11th/matrix).

#### Mission insert pattern

```sql
with ed as (select id from public.editions where short_name = '11th'),
     fd as (select id, name from public.force_dispositions where edition_id = (select id from ed))
insert into public.missions (name, edition_id, force_disposition_id, opponent_force_disposition_id)
select m.name, (select id from ed),
       (select id from fd where name = m.deck),
       (select id from fd where name = m.vs)
from (values
  ('Battlefield Dominance', 'Take and Hold', 'Take and Hold'),
  ('Immovable Object',      'Take and Hold', 'Purge the Foe'),
  -- ... all 25 rows
) as m(name, deck, vs)
on conflict (edition_id, name) do nothing;
```

If an admin pre-entered a mission by name without mappings, `on conflict do nothing` leaves it unmapped; follow the insert with an `update ... set force_disposition_id = ..., opponent_force_disposition_id = ... where edition_id = (select id from ed) and force_disposition_id is null` pass driven by the same VALUES list so pre-entered rows get their mappings.

## Implementation

### Key Files

| Action | File | Description |
|---|---|---|
| Create | `supabase/migrations/XXXXXX_seed_11th_edition_data.sql` | Deployments + mapped missions seed |

### Approach

Single self-contained migration. No application code changes — the existing edition-aware form and admin pages pick the rows up automatically.

Verification after applying:

1. `select count(*) from missions where edition_id = (select id from editions where short_name='11th')` → 25, all with non-null mappings.
2. `select count(*) from deployments where edition_id = ...` → 6.
3. `select count(*) from missions ... group by force_disposition_id` → 5 rows of 5.
4. Open `/admin/editions/[11th-id]/missions` and `/deployments` — the catalog renders.
5. Open the battle report submit form, pick 11th Edition — deployment dropdown shows the six entries.

## Key Design Decisions

1. **Seed via migration, not admin data entry** — The 25-mission matrix is easy to mistype by hand and the mapping columns aren't editable until `admin-force-dispositions.md` ships. A migration is reviewable against the reference doc and reproducible across environments.

2. **Name-based lookups + idempotent inserts** — Serial ids differ between environments (local/preview/prod). Names under the per-edition unique indexes are the stable keys.

3. **Mission card scoring text is not seeded** — `missions` only models `name` today. Storing full card text/VP breakdowns is out of scope for battle report recording; the reference doc keeps the verbatim text if a future feature needs it.

## Notes

- Depends on `force-dispositions-data-model.md` (mapping columns + the five 11th disposition rows).
- Deployment zone dimensions and the per-pairing A/B/C layout recommendations are intentionally not modeled (see Open Questions in the reference doc — dimensions are single-source/unverified, and layouts are per-pairing rather than per-deployment).
