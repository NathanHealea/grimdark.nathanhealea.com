# Battle Report Round Stats

**Epic:** Battle Reports
**Type:** Feature
**Status:** Todo

## Summary

Add optional per-round stat tracking to battle reports. When filling out a battle report, users can record stats for each round played: points earned, units lost, and models lost for both attacker and defender. An "Add Round" button lets users add up to 5 rounds. Round stats are fully optional — even for published reports — providing an additional level of detail for players who want to track game progression.

## Acceptance Criteria

- [ ] A new "Round Stats" section appears on the battle report form between the Defender and Reporting sections
- [ ] Users can add rounds via an "Add Round" button (up to 5 rounds max)
- [ ] Each round captures: attacker points earned, attacker units lost, attacker models lost, defender points earned, defender units lost, defender models lost
- [ ] Users can remove a round they've added
- [ ] All round stat fields are non-negative integers
- [ ] Round stats are optional — reports can be published without any round stats
- [ ] Round stats are saved when submitting a new battle report
- [ ] Round stats are loaded and editable when editing an existing battle report
- [ ] Round stats are displayed on the battle report detail view (only when present)
- [ ] Deleting a battle report cascades and removes its round stats
- [ ] Round stats follow the same access control as their parent battle report
- [ ] Build and lint pass

## Routes

No new routes. Existing routes modified:

| Route | Description |
|---|---|
| `/battle-reports/submit` | Form includes new Round Stats section |
| `/battle-reports/[id]/edit` | Form loads and displays existing round stats |
| `/battle-reports/[id]` | Detail view displays round stats when present |

## Database

### Migration: `supabase/migrations/XXXXXX_create_battle_report_round_stats.sql`

Create a `battle_report_round_stats` table linked to `battle_reports` via FK with cascade delete.

```sql
CREATE TABLE public.battle_report_round_stats (
  id serial PRIMARY KEY,
  battle_report_id uuid NOT NULL REFERENCES public.battle_reports(id) ON DELETE CASCADE,
  round_number integer NOT NULL CHECK (round_number >= 1 AND round_number <= 5),
  attacker_points_earned integer NOT NULL DEFAULT 0 CHECK (attacker_points_earned >= 0),
  attacker_units_lost integer NOT NULL DEFAULT 0 CHECK (attacker_units_lost >= 0),
  attacker_models_lost integer NOT NULL DEFAULT 0 CHECK (attacker_models_lost >= 0),
  defender_points_earned integer NOT NULL DEFAULT 0 CHECK (defender_points_earned >= 0),
  defender_units_lost integer NOT NULL DEFAULT 0 CHECK (defender_units_lost >= 0),
  defender_models_lost integer NOT NULL DEFAULT 0 CHECK (defender_models_lost >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (battle_report_id, round_number)
);
```

### RLS Policies

- **SELECT:** Public for published reports; report owner can read own drafts; admins/organizers can read all
- **INSERT:** Report owner or admin
- **UPDATE:** Report owner or admin
- **DELETE:** Report owner or admin (also cascades on battle report deletion)

## Implementation

### Key Files

| Action | File | Description |
|---|---|---|
| Create | `supabase/migrations/XXXXXX_create_battle_report_round_stats.sql` | New table, constraints, RLS policies |
| Modify | `src/types/battle-report.ts` | Add `BattleReportRoundStat` and `RoundStatFormValues` types |
| Modify | `src/modules/battle-report/validation.ts` | Add `validateRoundStatField` validator, add `round_stats` error key |
| Modify | `src/modules/battle-report/queries.ts` | Add `getRoundStatsByReportId()` query |
| Modify | `src/modules/battle-report/components/battle-report-form.tsx` | Add Round Stats section with dynamic add/remove UI |
| Modify | `src/app/battle-reports/submit/actions.ts` | Parse round stats JSON, insert into new table after report insert |
| Modify | `src/app/battle-reports/[id]/edit/actions.ts` | Delete-and-reinsert round stats on update |
| Modify | `src/app/battle-reports/[id]/edit/page.tsx` | Fetch round stats and pass as prop to form |
| Modify | `src/app/battle-reports/[id]/page.tsx` | Fetch and display round stats on detail view |

### Approach

#### 1. Database migration

Create the `battle_report_round_stats` table with `ON DELETE CASCADE` on the battle report FK. The `UNIQUE (battle_report_id, round_number)` constraint prevents duplicate rounds. All stat fields default to 0 and are NOT NULL — a round that exists always has values. RLS policies mirror the parent battle report's access control.

After applying the migration, run `npm run db:types` to regenerate TypeScript types.

#### 2. TypeScript types

Add to `src/types/battle-report.ts`:

```typescript
export type BattleReportRoundStat = {
  id: number
  battle_report_id: string
  round_number: number
  attacker_points_earned: number
  attacker_units_lost: number
  attacker_models_lost: number
  defender_points_earned: number
  defender_units_lost: number
  defender_models_lost: number
  created_at: string
}

export type RoundStatFormValues = {
  round_number: number
  attacker_points_earned: string
  attacker_units_lost: string
  attacker_models_lost: string
  defender_points_earned: string
  defender_units_lost: string
  defender_models_lost: string
}
```

#### 3. Query function

Add `getRoundStatsByReportId(reportId)` to `src/modules/battle-report/queries.ts`. Fetches all round stats for a report ordered by `round_number`.

#### 4. Form UI — Round Stats section

Add a "Round Stats" section to the battle report form as the 5th section (between Defender and Reporting). Key behaviors:

- **State**: Manage a `RoundStatFormValues[]` array in local state, initialized from `defaultRoundStats` prop (for edit mode)
- **Add Round**: Button appends a new entry. Auto-numbers based on array position. Disabled at 5 rounds.
- **Remove Round**: Each round card has a remove button. Remaining rounds re-number.
- **Layout per round**: Compact card with `label-meta` headers for "Attacker" and "Defender", each with a 3-column responsive grid (`grid-cols-1 sm:grid-cols-3`) for the 3 stat fields.
- **Serialization**: On submit, serialize round stats to a hidden `round_stats_json` FormData field as JSON.
- **Client validation**: Validate all fields are non-negative integers before submission.

#### 5. Server actions — Submit

Modify the submit action to:
1. Add `.select('id').single()` to the insert call to retrieve the new report ID
2. Parse `round_stats_json` from FormData
3. Validate entries (non-negative integers, max 5 rounds)
4. Insert rows into `battle_report_round_stats`

#### 6. Server actions — Edit

Modify the edit action to:
1. Delete existing round stats for the report (`DELETE WHERE battle_report_id = reportId`)
2. Parse and insert new round stats (same logic as submit)

The delete-and-reinsert approach avoids complex upsert/diff logic and is appropriate since round stat IDs are not referenced elsewhere.

#### 7. Edit page data loading

Add `getRoundStatsByReportId(id)` to the `Promise.all` in the edit page and pass the result as `defaultRoundStats` prop to the form.

#### 8. Detail view display

Fetch round stats in the detail page's `Promise.all`. Display a "Round Stats" section (only if `roundStats.length > 0`) with compact cards showing attacker/defender stats per round in a 2-column layout.

#### 9. Build and lint

Run `npm run build` and `npm run lint` to verify no errors.

## Key Design Decisions

1. **Separate table over JSON column** — A normalized `battle_report_round_stats` table is queryable for future stats/analytics (e.g., "average points per round", "models lost trends"), maintains relational integrity, and follows the existing codebase pattern of separate tables with FKs.

2. **Round stats are fully optional** — Not every player wants to track this level of detail. Making round stats required would add friction to the core battle report workflow. The feature adds capability without mandating it.

3. **Delete-and-reinsert for edits** — When updating round stats, deleting all existing rows and reinserting is simpler than diffing changes. The `serial` ID on round stats is not referenced by anything else, making this safe and clean.

4. **JSON serialization over indexed FormData** — Serializing round stats as a single JSON string in a hidden input is simpler than parsing `round_stats[0][attacker_points]` patterns from FormData. The server action parses one JSON string.

5. **NOT NULL with DEFAULT 0 for stat fields** — A round that exists always has values (defaulting to 0). This avoids "does null mean not tracked or zero?" ambiguity. Users explicitly add rounds — if a round exists, its fields have meaning.

6. **No relationship constraint between `rounds` and round stats count** — The existing `rounds` field (how many rounds were played) and round stats entries are independent. A user can say "5 rounds played" but only record stats for 3, or none at all.

## Notes

- The submit action currently doesn't return the inserted report ID (`.insert()` without `.select()`). This must be changed to `.insert().select('id').single()` to get the ID for round stats insertion.
- The battle report form is already ~540 lines. Consider extracting the Round Stats section into a separate child component to keep the main form readable.
- Mobile responsiveness: use `grid-cols-1 sm:grid-cols-3` for the stat fields so they stack vertically on small screens.
- Future enhancement: aggregate round stats for player analytics (average points per round, total models lost per season, etc.).
