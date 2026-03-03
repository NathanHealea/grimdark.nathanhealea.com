# Round Stats Auto-Computed Totals

**Epic:** Battle Reports
**Type:** Enhancement
**Status:** Todo

## Summary

Auto-compute battle report scores and casualty totals from per-round stats. When a user adds or edits round stats, the attacker/defender score fields update in real-time by summing each round's points earned. Four new fields — attacker total units lost, attacker total models lost, defender total units lost, and defender total models lost — are similarly computed from round stat entries and displayed on the battle report.

## Motivation

The [Battle Report Round Stats](battle-report-round-stats.md) feature lets users record per-round stats (points earned, units lost, models lost) but the existing attacker/defender score fields remain manual. This creates a disconnect: a user might enter round-by-round points that don't match the manually entered total score. Additionally, there's no way to track aggregate unit and model losses at the report level — only per-round. Auto-computing these totals from round data eliminates manual math, prevents inconsistencies, and surfaces aggregate casualty data that's useful for future stats and analytics.

## Acceptance Criteria

- [ ] Four new columns exist on `battle_reports`: `attacker_total_units_lost`, `attacker_total_models_lost`, `defender_total_units_lost`, `defender_total_models_lost`
- [ ] New columns are nullable integers (null when no round stats exist) with `CHECK >= 0`
- [ ] When round stats are present in the form, `attacker_score` auto-updates to the sum of all rounds' `attacker_points_earned`
- [ ] When round stats are present in the form, `defender_score` auto-updates to the sum of all rounds' `defender_points_earned`
- [ ] When round stats are present, the score fields become read-only with a visual indicator that they are auto-computed
- [ ] When no round stats are present, the score fields remain manually editable (existing behavior)
- [ ] `attacker_total_units_lost` is computed as the sum of all rounds' `attacker_units_lost`
- [ ] `attacker_total_models_lost` is computed as the sum of all rounds' `attacker_models_lost`
- [ ] `defender_total_units_lost` is computed as the sum of all rounds' `defender_units_lost`
- [ ] `defender_total_models_lost` is computed as the sum of all rounds' `defender_models_lost`
- [ ] Totals update in real-time on the client as round stat values are typed
- [ ] Server actions compute and store the totals from round stats on submit/edit
- [ ] The battle report detail view displays total units lost and total models lost (when present)
- [ ] Reports without round stats have null totals (not zero)
- [ ] Build and lint pass

## Approach

### Key Files

| Action | File | Description |
|---|---|---|
| Create | `supabase/migrations/XXXXXX_add_battle_report_totals.sql` | Add 4 new nullable columns to `battle_reports` |
| Modify | `src/types/battle-report.ts` | Add 4 new fields to `BattleReport` type |
| Modify | `src/modules/battle-report/components/battle-report-form.tsx` | Auto-compute scores and totals from round stats; make score fields read-only when rounds exist |
| Modify | `src/app/battle-reports/submit/actions.ts` | Compute and store totals from round stats JSON |
| Modify | `src/app/battle-reports/[id]/edit/actions.ts` | Compute and store totals on update |
| Modify | `src/app/battle-reports/[id]/page.tsx` | Display total units lost and models lost |

### 1. Database migration

Add four nullable integer columns to `battle_reports`:

```sql
ALTER TABLE public.battle_reports
  ADD COLUMN attacker_total_units_lost integer CHECK (attacker_total_units_lost >= 0),
  ADD COLUMN attacker_total_models_lost integer CHECK (attacker_total_models_lost >= 0),
  ADD COLUMN defender_total_units_lost integer CHECK (defender_total_units_lost >= 0),
  ADD COLUMN defender_total_models_lost integer CHECK (defender_total_models_lost >= 0);
```

Columns are nullable — `null` means no round stats were provided (distinct from 0). No DEFAULT is set so existing reports remain null. After applying, run `npm run db:types` to regenerate TypeScript types.

### 2. TypeScript types

Add the 4 new fields to the `BattleReport` type in `src/types/battle-report.ts`:

```typescript
attacker_total_units_lost: number | null
attacker_total_models_lost: number | null
defender_total_units_lost: number | null
defender_total_models_lost: number | null
```

### 3. Form auto-computation (client-side)

In the battle report form, add a computation effect that watches the round stats array:

- **When round stats array has entries**: Sum `attacker_points_earned` across all rounds → set `attacker_score`. Sum `defender_points_earned` → set `defender_score`. Mark score fields as read-only with a helper text like "Auto-computed from round stats".
- **When round stats array is empty**: Score fields revert to normal editable inputs (existing behavior).
- **Total units/models lost**: Computed the same way but stored as hidden fields or included in the round stats JSON payload. These don't need visible form inputs since they're purely derived values.

The computation should run on every change to any round stat value so the score fields update in real-time as the user types.

### 4. Score field read-only behavior

When at least one round exists in the round stats array:
- Set `readOnly` on the `attacker_score` and `defender_score` `<input>` elements
- Apply a visual style to indicate the field is auto-computed (e.g., `bg-base-200 cursor-not-allowed` styling, or a small "(auto)" label)
- The `value` is computed from round stats, not from manual input

When the user removes all rounds (back to 0), restore normal editable behavior and clear the auto-computed values so the user can enter scores manually.

### 5. Server actions — Submit

After inserting round stats rows, compute the totals:

```typescript
const attackerScore = roundStats.reduce((sum, r) => sum + r.attacker_points_earned, 0)
const defenderScore = roundStats.reduce((sum, r) => sum + r.defender_points_earned, 0)
const attackerTotalUnitsLost = roundStats.reduce((sum, r) => sum + r.attacker_units_lost, 0)
const attackerTotalModelsLost = roundStats.reduce((sum, r) => sum + r.attacker_models_lost, 0)
const defenderTotalUnitsLost = roundStats.reduce((sum, r) => sum + r.defender_units_lost, 0)
const defenderTotalModelsLost = roundStats.reduce((sum, r) => sum + r.defender_models_lost, 0)
```

Update the battle report row with these computed values. If no round stats are provided, set all 4 total columns to `null` and leave the manually-entered score as-is.

### 6. Server actions — Edit

Same computation as submit. On the delete-and-reinsert of round stats, recompute totals and update the battle report. If all rounds are removed during edit, set totals to `null` and allow the manually-entered scores to persist.

### 7. Detail view display

On the battle report detail page, display the total units lost and models lost alongside the existing score display. Only show when values are non-null (i.e., round stats were provided). Use a compact layout under each player's score:

```
Attacker: 45 pts  |  3 units lost  |  12 models lost
Defender: 38 pts  |  2 units lost  |  8 models lost
```

### 8. Build and lint

Run `npm run build` and `npm run lint` to verify no errors.

## Key Decisions

1. **Nullable columns over NOT NULL DEFAULT 0** — Using nullable columns distinguishes "no round stats provided" (null) from "round stats provided but all zeros" (0). This preserves the semantic meaning that totals only exist when round data exists.

2. **Store computed totals in the database** — Even though totals could be derived from round stats at query time, storing them on the `battle_reports` row avoids a join or subquery for every report listing, leaderboard calculation, or stats query. The values are recomputed on every save, so they stay in sync.

3. **Client-side auto-compute over server-only** — Computing totals in real-time on the client provides immediate feedback as users fill in round stats. The server recomputes independently as the source of truth, so the client computation is purely for UX.

4. **Read-only score fields when rounds exist** — Prevents the score from diverging from round totals. If a user enters round-by-round points, the total score must equal their sum. Making the field read-only communicates this clearly and prevents accidental manual overrides.

5. **Graceful fallback when no rounds** — Reports without round stats keep their existing manual score behavior. The enhancement only activates when the user opts into round-by-round tracking, preserving backwards compatibility.

## Notes

- **Depends on**: [Battle Report Round Stats](battle-report-round-stats.md) — the round stats table and form UI must be implemented first.
- The `attacker_score` and `defender_score` columns already exist on `battle_reports`. This enhancement changes how they're populated (auto-computed vs manual) but does not alter the column schema.
- Future enhancement: use the total units/models lost data for player analytics (e.g., "most destructive player", "most resilient army").
- The 4 new total columns live on `battle_reports` rather than being computed via a database view or trigger because the existing codebase pattern is to compute in server actions and store directly.
