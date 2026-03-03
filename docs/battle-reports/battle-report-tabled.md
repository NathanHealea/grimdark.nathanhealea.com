# Battle Report Tabled Indicator

**Epic:** Battle Reports
**Type:** Enhancement
**Status:** In Progress

## Summary

Add a "tabled" checkbox for both attacker and defender on battle reports. "Tabled" means all units in a player's army were destroyed during the game. This is a notable event in Warhammer 40k and worth tracking for stats and bragging rights.

## Motivation

Getting tabled (having your entire army wiped out) is a significant game event in Warhammer 40k. Currently there's no way to record this in a battle report. Tracking it enables future stats like "times tabled" or "times you tabled your opponent" and adds flavor to battle report details.

## Acceptance Criteria

- [x] The `battle_reports` table has `attacker_tabled` and `defender_tabled` boolean columns (default `false`)
- [x] The battle report form shows a "Tabled" checkbox for each player (attacker and defender)
- [x] The checkbox is optional for both draft and published reports
- [x] The battle report detail page shows a "Tabled" badge next to a player's outcome when they were tabled
- [x] The edit form pre-fills the tabled checkboxes from existing report data
- [x] The TypeScript `BattleReport` type includes `attacker_tabled` and `defender_tabled` fields

## Approach

### Step 1: Database migration

Add two boolean columns to `battle_reports`:

```sql
ALTER TABLE battle_reports
  ADD COLUMN attacker_tabled boolean NOT NULL DEFAULT false,
  ADD COLUMN defender_tabled boolean NOT NULL DEFAULT false;
```

No CHECK constraint needed — these are simple booleans with a safe default. Existing reports get `false` automatically.

### Step 2: Update TypeScript types

Add to `BattleReport` in `src/types/battle-report.ts`:

```typescript
attacker_tabled: boolean
defender_tabled: boolean
```

Regenerate types with `npm run db:types` to keep the generated Supabase types in sync.

### Step 3: Update the battle report form

In `src/modules/battle-report/components/battle-report-form.tsx`:

- Add `attackerTabled` and `defenderTabled` state (boolean, default `false`)
- Add a DaisyUI checkbox in each player's section (attacker and defender), labeled "Tabled" with a description like "All units destroyed"
- Wire to hidden inputs or form data for submission
- Pre-fill from `defaultValues` in edit mode

### Step 4: Update server actions

In both `src/app/battle-reports/submit/actions.ts` and `src/app/battle-reports/[id]/edit/actions.ts`:

- Read `attacker_tabled` and `defender_tabled` from `formData` (checkbox values — present means `true`, absent means `false`)
- Include in the insert/update object
- No validation needed beyond boolean coercion — these are always optional

### Step 5: Update the detail page

In `src/app/battle-reports/[id]/page.tsx`:

- When `report.attacker_tabled` is `true`, show a "Tabled" badge (e.g., `badge badge-neutral`) next to the attacker's outcome badge
- Same for `report.defender_tabled` on the defender side

### Step 6: Update the battle report cards

In any battle report list views (profile page, season page, battle reports feed) that show outcome badges, also show the "Tabled" badge when applicable. Check:

- `src/app/profile/[profileId]/page.tsx` — battle report cards
- `src/app/seasons/[id]/page.tsx` — season battle report cards
- `src/app/battle-reports/page.tsx` — main feed

### Key Files

| Action | File | Description |
|---|---|---|
| Create | `supabase/migrations/XXXX_add_tabled_to_battle_reports.sql` | Add boolean columns |
| Modify | `src/types/battle-report.ts` | Add tabled fields to type |
| Modify | `src/modules/battle-report/components/battle-report-form.tsx` | Add tabled checkboxes |
| Modify | `src/app/battle-reports/submit/actions.ts` | Handle tabled in form submission |
| Modify | `src/app/battle-reports/[id]/edit/actions.ts` | Handle tabled in form update |
| Modify | `src/app/battle-reports/[id]/page.tsx` | Show tabled badge on detail view |
| Modify | `src/app/profile/[profileId]/page.tsx` | Show tabled badge in battle report cards |
| Modify | `src/app/seasons/[id]/page.tsx` | Show tabled badge in battle report cards |
| Modify | `src/app/battle-reports/page.tsx` | Show tabled badge in feed cards |

## Key Decisions

1. **Boolean columns with `false` default** — Simple, safe for existing data. No need for nullable booleans since "not tabled" is the obvious default.

2. **Optional for both draft and published** — Unlike scores and outcomes, tabling is supplementary info. The existing `published_fields_required` CHECK constraint doesn't need updating since these fields always have a valid default.

3. **Badge display rather than inline text** — A small neutral badge ("Tabled") next to the outcome badge keeps the visual pattern consistent and doesn't clutter the layout.

## Notes

- The tabled state is independent of the outcome — a player can be tabled and still win (unlikely but rules-legal in some edge cases). Don't auto-set outcome based on tabled status.
- Future stats work could aggregate tabled counts per player for fun leaderboard stats.
