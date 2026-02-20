# Submit a Battle Report

**Epic:** Battle Reports
**Status:** Done

## Summary

Allow members to submit a battle report capturing the players, factions, points, outcome, and mission played.

## Acceptance Criteria

- [x] Authenticated user with the member or admin roles can submit a battle report
- [x] Report captures: both players, their factions, point values, outcome (win/loss/draw), and mission. See Battle Report Data
- [x] Submitted reports are saved to the database
- [x] Validation prevents incomplete submissions
  - [x] Attacker and Defender cannot be the same player.
- [x] Player references are limited to users with the member role.
- [x] Submitter, and admin can modify reports.
- [x] Reports are publicly available.

## Implementation

### Database

**Migration:** `supabase/migrations/20260219220000_create_battle_reports.sql`

Four tables created:

- `missions` — lookup table seeded with 10 missions
- `deployments` — lookup table seeded with 7 deployments
- `battle_points` — lookup table with name and point size, seeded with 4 battle sizes
- `battle_reports` — main table with foreign keys to profiles, factions, missions, deployments, and battle_points

**Migration:** `supabase/migrations/20260219230000_add_event_date_to_battle_reports.sql`

- Adds `event_date` column (`date NOT NULL DEFAULT CURRENT_DATE`) to `battle_reports` to record when the battle took place, separate from `created_at` (when the report was submitted)

**RLS Policies:**
- SELECT: public (anon + authenticated) for all tables
- INSERT: authenticated users with member or admin role (battle_reports only)
- UPDATE: reported_by user or admin role (battle_reports only)

**Constraints:**
- attacker_id != defender_id (check constraint)
- attacker/defender scores >= 0
- attacker/defender outcomes must be 'win', 'loss', or 'draw'
- rounds between 1 and 5
- updated_at trigger reuses existing `handle_updated_at()` function

### Types

**File:** `src/types/battle-report.ts`

- `BattleReport` — full database row type (includes `event_date`)
- `Outcome` — 'win' | 'loss' | 'draw'
- `Mission`, `Deployment`, `BattlePoints` — lookup table types

### Module

**File:** `src/modules/battle-report/queries.ts`
- `getMissions()` — fetch all missions ordered by name
- `getDeployments()` — fetch all deployments ordered by name
- `getBattlePoints()` — fetch all battle points ordered by size
- `getMembers()` — fetch profiles with the 'member' role
- `getMemberFactions()` — fetch all profile-faction associations

**File:** `src/modules/battle-report/validation.ts`
- `validatePlayerId()` — valid UUID, required
- `validateFactionId()` — valid UUID, required
- `validateScore()` — integer >= 0
- `validateOutcome()` — must be 'win', 'loss', or 'draw'
- `validateEventDate()` — non-empty, valid date format
- `validateRounds()` — integer 1-5
- `validateSelectId()` — valid integer ID for mission/deployment/battle_points

### Server Action

**File:** `src/app/battle-reports/submit/actions.ts`

`submitBattleReport()` — authenticates user, checks member/admin role, validates all fields (including `event_date`), validates attacker != defender, inserts into database, revalidates paths.

### Page & Form

**File:** `src/app/battle-reports/submit/page.tsx`
- Server component that authenticates user, checks role, fetches all lookup data in parallel, renders form

**File:** `src/app/battle-reports/submit/battle-report-form.tsx`
- Client component with `useActionState` for form submission
- Three sections: Game Details (first), Attacker, Defender
- Game Details includes date picker (`event_date`, max today), mission, deployment, battle size, and rounds played (dropdown 1-5)
- Faction dropdowns filter to show only factions associated with the selected player
- All inputs are controlled via a single `values` state object — form retains all values on validation errors and only resets on successful submission
- Uses `onSubmit` with `preventDefault` (instead of form `action`) to prevent React 19's automatic form reset from clearing select values on server errors
- Client-side validation before server submission, including inline error when attacker and defender are the same player
- Error display per field, success/error alerts

## Battle Report Data

- **Event Date:** The date the battle took place (`date` type, no future dates allowed).
- **Attacker:** The attacking player; reference to profile.
- **Attacker Army:** The army played by the attacking player; reference to faction.
- **Attacker Score:** The ending score of the attacker player.
- **Attacker Outcome:** The outcome of the attacking player (Win, Loss, Draw).
- **Defender:** The defending player; reference to profile.
- **Defender Army:** The army played by the defending player; reference to faction.
- **Defender Score:** The ending score of the defender player.
- **Defender Outcome:** The outcome of the defending player (Win, Loss, Draw).
- **Mission:** The mission played; reference to mission lookup table.
  - Burden of Trust, Hidden Supplies, Linchpin, Purge the Foe, Scorched Earth, Supply Drop, Take and Hold, Terraform, The Ritual, Unexplored Ordnances
- **Deployment:** The deployment used; reference to deployment lookup table.
  - Dawn of War, Hammer and Anvil, Search and Destroy, Sweeping Engagement, Crucible of Battle, Tipping Point, Outflank
- **Battle Size:** The game size; reference to battle points lookup table.
  - Combat Patrol (500), Incursion (1000), Strike Force (2000), Onslaught (3000)
- **Rounds:** The number of rounds played (1-5, dropdown select).
- **Reported By:** The player who submitted the battle report.

## Route

`/battle-reports/submit` — Submit battle report form (members/admins only)
