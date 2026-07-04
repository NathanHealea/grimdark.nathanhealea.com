# Battle Report Force Dispositions

**Epic:** 11th Edition Battle Reports
**Type:** Feature
**Status:** Done
**Branch:** feature/battle-report-force-dispositions
**Merge Into:** epic/11th-edition-battle-reports

## Summary

Record 11th edition games on battle reports. When the selected edition uses Force Dispositions, the submit/edit form replaces the single Mission dropdown with a Force Disposition select per player, shows each player's **derived** primary mission from the 5×5 matrix, and offers optional per-player Secondary Missions mode (Tactical or Fixed) tracking. 10th edition reports keep the exact current flow: the edition select (already required) is what switches the form between the two shapes. All other functionality — drafts, scores, outcomes, tabled, units/models lost, round stats, seasons — is shared by both editions unchanged.

## Acceptance Criteria

### Data Model

- [x] `battle_reports` has nullable `attacker_force_disposition_id` / `defender_force_disposition_id` FKs to `force_dispositions`
- [x] `battle_reports` has nullable `attacker_secondary_mode` / `defender_secondary_mode` (`'tactical'` or `'fixed'`)
- [x] A published report requires either a mission (classic) or both dispositions (disposition edition) — `published_fields_required` updated
- [x] The edition-integrity trigger also rejects dispositions that don't belong to the report's edition, and rejects a report carrying both a mission and dispositions

### Submit / Edit Form

- [x] Selecting an edition with Force Dispositions (11th) hides the Mission dropdown and shows an "Attacker Force Disposition" and "Defender Force Disposition" select, populated from that edition's dispositions
- [x] Once both dispositions are chosen, the form displays each player's derived primary mission (read-only), resolved from the mission mapping matrix
- [x] Optional "Secondary Missions" mode select (Tactical / Fixed / not recorded) per player
- [x] Selecting an edition without dispositions (10th) renders exactly the current form — single Mission dropdown, no disposition fields
- [x] Changing edition clears fields that don't belong to the new edition (mission, deployment, dispositions) with the existing inline cleared-note pattern
- [x] Publishing requires both dispositions on a disposition edition (mission not required); drafts save with any subset
- [x] Deployment continues to filter by edition (already works — the 11th list comes from the data seed)
- [x] Server-side validation rejects published disposition-edition reports missing a disposition, dispositions from another edition, or a mission set alongside dispositions
- [x] Editing an existing 10th edition report is unchanged; editing an 11th edition report pre-fills dispositions and secondary modes

## Database

### Migration: `supabase/migrations/XXXXXX_add_force_dispositions_to_battle_reports.sql`

```sql
alter table public.battle_reports
  add column attacker_force_disposition_id integer references public.force_dispositions(id) on delete restrict,
  add column defender_force_disposition_id integer references public.force_dispositions(id) on delete restrict,
  add column attacker_secondary_mode text check (attacker_secondary_mode in ('tactical', 'fixed')),
  add column defender_secondary_mode text check (defender_secondary_mode in ('tactical', 'fixed'));

alter table public.battle_reports
  add constraint dispositions_both_or_neither
  check ((attacker_force_disposition_id is null) = (defender_force_disposition_id is null));
```

Replace `published_fields_required` (from `20260223100000_add_battle_report_status.sql`): the `mission_id is not null` term becomes

```sql
(mission_id is not null
 or (attacker_force_disposition_id is not null and defender_force_disposition_id is not null))
```

with every other required-when-published term unchanged.

Extend `validate_battle_report_edition()` (from `20260517000000_add_edition_to_battle_reports.sql`) and recreate the trigger to also fire on the two disposition columns:

- each non-null disposition's `edition_id` must equal `new.edition_id`
- `new.mission_id` and the disposition pair are mutually exclusive — raise if both present

## Implementation

### Key Files

| Action | File | Description |
|---|---|---|
| Create | `supabase/migrations/XXXXXX_add_force_dispositions_to_battle_reports.sql` | Columns, checks, constraint + trigger updates |
| Modify | `src/types/battle-report.ts` | Add the four columns to `BattleReport`; add `SecondaryMode` union |
| Modify | `src/modules/battle-report/validation.ts` | `BattleReportFormState` fields; `validateForceDispositions` (publish-aware, both-or-neither) |
| Modify | `src/modules/battle-report/queries.ts` | Select new columns; add `getForceDispositionsForForm` aggregation if needed |
| Modify | `src/modules/battle-report/components/battle-report-form.tsx` | Disposition-mode section, derived primary display, secondary mode selects, edition-change clearing |
| Modify | `src/app/battle-reports/submit/page.tsx` | SSR `dispositionsByEdition` prop (parallel to `missionsByEdition`, built from `getForceDispositionsByEditionId`) |
| Modify | `src/app/battle-reports/submit/actions.ts` | Read/validate/persist the four fields; edition-mode cross-checks |
| Modify | `src/app/battle-reports/[id]/edit/page.tsx` | Same SSR prop; pre-fill |
| Modify | `src/app/battle-reports/[id]/edit/actions.ts` | Same validation/persistence |

### Approach

#### 1. Form mode detection

The form already receives `missionsByEdition` / `deploymentsByEdition` and tracks `edition_id` with `updateEdition()` clearing stale selections (`battle-report-form.tsx:203-245`). Add `dispositionsByEdition: Record<number, ForceDisposition[]>`. Derived flag:

```ts
const editionDispositions = dispositionsByEdition[Number(values.edition_id)] ?? []
const usesDispositions = editionDispositions.length > 0
```

`usesDispositions` switches the Game Details block: Mission select (current, `~466`) when false; the disposition section when true. Keep both registered under stable names — `mission_id` renders nothing in disposition mode (no hidden stale value submitted).

#### 2. Disposition section

Two selects styled like the existing mission/deployment selects, labeled with each player's display name where available ("Attacker — Force Disposition"). Below them, once both are set, a read-only derived-primary panel:

```ts
const attackerPrimary = filteredMissions.find(m =>
  m.force_disposition_id === attackerDispositionId &&
  m.opponent_force_disposition_id === defenderDispositionId)
const defenderPrimary = filteredMissions.find(m =>
  m.force_disposition_id === defenderDispositionId &&
  m.opponent_force_disposition_id === attackerDispositionId)
```

Render "Attacker plays *Death Trap* — Defender plays *Reconnaissance Sweep*" (mirror matchups show the same mission twice). If a mapping row is missing (misconfigured edition), show "No mission mapped for this matchup" — non-blocking; the mission is derived data, not a form field.

Secondary mode: two small selects (Not recorded / Tactical / Fixed), always optional, submitted as `attacker_secondary_mode` / `defender_secondary_mode`.

#### 3. Edition-change clearing

Extend `updateEdition()`: on edition change, additionally clear `attacker_force_disposition_id` / `defender_force_disposition_id` when they don't belong to the new edition (they never carry over — disposition ids are edition-scoped) and fold that into the existing `editionClearedNote` message. Secondary modes persist (edition-agnostic values).

#### 4. Validation

`validation.ts`:

- Add `attacker_force_disposition_id`, `defender_force_disposition_id`, `attacker_secondary_mode`, `defender_secondary_mode` to `BattleReportFormState`.
- New `validateForceDisposition(value, { required })` mirroring `validateSelectId` (`validation.ts:156`).
- Publish-time rule, driven by a `usesDispositions` argument the actions compute server-side: disposition edition → both dispositions required, mission must be empty; classic edition → mission required (current rule), dispositions must be empty.

#### 5. Server actions

`submit/actions.ts` and `[id]/edit/actions.ts`:

1. Read the four new fields from form data (empty string → null).
2. Compute `usesDispositions` from `getForceDispositionsByEditionId(edition_id)` — server-derived, never trusted from the client.
3. Apply the publish-time rule above; validate each disposition id is in that edition's set (friendly error before the trigger backstop).
4. Include all four columns in the insert/update payload (edit clears them when switching to a classic edition).

#### 6. SSR pages

Both pages already build `missionsByEdition`/`deploymentsByEdition` per published edition (`submit/page.tsx:43-65`, `[id]/edit/page.tsx:56-82`). Add `getForceDispositionsByEditionId` to the same `Promise.all` fan-out to build `dispositionsByEdition`. Editions without dispositions get `[]`, which the form reads as classic mode.

## Key Design Decisions

1. **Primary missions are derived, never stored** — The matrix makes each player's primary mission a pure function of the two dispositions. Storing `attacker_mission_id`/`defender_mission_id` would duplicate that fact and invite drift; deriving via the mission mapping keeps one source of truth. `mission_id` stays null on disposition reports, enforced by trigger.

2. **Behavior keyed on "edition has dispositions", not edition id** — Consistent with the rest of the epic; no `if (edition === 11)` anywhere. The server recomputes the flag rather than trusting a client field.

3. **Secondary tracking is mode-only** — Recording *which* secondaries were drawn/scored would need a `secondary_missions` catalog plus join tables and per-card scoring UI, disproportionate to league reporting needs today. The Tactical/Fixed mode is the high-signal datum. Full secondary tracking is a listed future enhancement.

4. **Round stats unchanged** — `battle_report_round_stats` (points/units/models per round) is edition-agnostic and fits 11th scoring as-is. Per-round primary/secondary VP splits and cap validation (15/round) are deferred with secondary tracking.

5. **Attacker/Defender framing is kept** — 11th edition formalizes Attacker and Defender (layouts label their edges), so the existing column naming maps cleanly; no rename needed.

6. **`dispositions_both_or_neither` as a table check** — A half-set pair is invalid in every state including drafts; the form clears both together, and the check makes that a guarantee rather than a convention.

## Notes

- Depends on `force-dispositions-data-model.md` (table, mapping columns) and `11th-edition-data-seed.md` (without the seed, 11th has dispositions but no mapped missions — the derived panel would show the misconfiguration notice).
- Display of the new fields on detail/feed/admin views is `battle-report-11th-display.md`.
- Manual verification: submit an 11th report (dispositions required on publish, derived missions correct per the matrix, secondary modes saved); save an 11th draft with one disposition missing → allowed as draft, blocked on publish; switch edition mid-form both directions → proper clearing + note; submit a 10th report → identical to today; direct API insert with mission + dispositions → trigger error.
