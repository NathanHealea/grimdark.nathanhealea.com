# Battle Report Draft/Published Status

**Epic:** Battle Reports
**Type:** Feature
**Status:** Completed

## Summary

Allow members to save incomplete battle reports as drafts and finish them later. Battle reports now have a `status` column (`draft` or `published`). The submit form offers two actions: "Save Draft" (saves with partial data, no validation) and "Submit" (publishes with full validation). Drafts are only visible to their author and admins; published reports remain publicly visible.

## Acceptance Criteria

- [x] Battle reports have a `status` field: `draft` or `published`
- [x] Existing reports default to `published` (no data migration needed)
- [x] Submit form has two buttons: "Save Draft" and "Submit"
- [x] "Save Draft" saves with incomplete fields and skips validation
- [x] "Submit" runs full validation and publishes immediately (existing behavior)
- [x] Published reports require all fields to be non-null (enforced by DB constraint)
- [x] Public battle report list only shows published reports
- [x] Draft owners can view their own drafts at `/battle-reports/drafts`
- [x] Draft owners can edit and publish a draft from `/battle-reports/[id]/edit`
- [x] Admins can view all reports including drafts (via RLS)
- [x] Anonymous users and other members cannot see drafts
- [x] Season is only assigned when a report is published (not on draft save)
- [x] Detail page shows "Draft" badge and "Edit Draft" button for draft owner
- [x] "My Drafts" link appears in member navigation

## Routes

| Route | Description |
|---|---|
| `/battle-reports/submit` | Submit form — now with "Save Draft" and "Submit" buttons |
| `/battle-reports/drafts` | Lists the current user's draft battle reports |
| `/battle-reports/[id]` | Detail view — shows draft badge and edit button for draft owner |
| `/battle-reports/[id]/edit` | Edit a draft (or published report for admins) — reuses the submit form |

## Database

### Migration: `supabase/migrations/XXXXXX_add_battle_report_status.sql`

Adds draft/published status support to the `battle_reports` table.

**Schema changes:**

1. **New column** `status text NOT NULL DEFAULT 'published'` with check constraint `status IN ('draft', 'published')`. Default ensures existing reports stay published.
2. **Relaxed NOT NULL** on 13 fields (attacker_id, attacker_faction_id, attacker_score, attacker_outcome, defender_id, defender_faction_id, defender_score, defender_outcome, mission_id, deployment_id, battle_points_id, rounds, event_date) so drafts can be saved with partial data.
3. **Updated constraint** `attacker_defender_different` — now allows NULLs: `attacker_id IS NULL OR defender_id IS NULL OR attacker_id != defender_id`.
4. **New constraint** `published_fields_required` — ensures published reports have all 13 fields non-null. Drafts are exempt.
5. **Updated trigger** `on_battle_report_assign_season` — now fires on INSERT and UPDATE, only assigns season when `status = 'published'`.

### RLS Policies

Old policy (replaced):
- **SELECT:** `Battle reports are publicly readable` — all users could read all reports

New policies:
- **SELECT:** `Published battle reports are publicly readable` — anon and authenticated can read where `status = 'published'`
- **SELECT:** `Reporters can view their own drafts` — authenticated users can read drafts where `reported_by` matches their profile
- **SELECT:** `Admins can view all battle reports` — users with the admin role can read all reports regardless of status
- **INSERT:** Unchanged — members and admins can insert
- **UPDATE:** Unchanged — reporter or admin can update

## Implementation

### Key Files

| Action | File | Description |
|---|---|---|
| Modify | `src/types/battle-report.ts` | Added `BattleReportStatus` type, `status` field, made 13 fields nullable |
| Modify | `src/modules/battle-report/validation.ts` | Added `validateStatus()`, updated form state type |
| Modify | `src/modules/battle-report/queries.ts` | Added `.eq('status', 'published')` filter to public queries, added `getDraftBattleReports()` |
| Modify | `src/app/battle-reports/submit/actions.ts` | Handle `status` field, skip validation for drafts, conditional insert |
| Modify | `src/app/battle-reports/submit/battle-report-form.tsx` | Dual buttons, `defaultValues`/`reportId` props for edit mode |
| Create | `src/app/battle-reports/[id]/edit/actions.ts` | `updateBattleReport()` server action with ownership check |
| Create | `src/app/battle-reports/[id]/edit/page.tsx` | Edit page — fetches draft, renders form with pre-populated values |
| Create | `src/app/battle-reports/drafts/page.tsx` | Drafts list page — shows current user's drafts |
| Modify | `src/app/battle-reports/[id]/page.tsx` | Draft badge, "Edit Draft" button, null-safe rendering |
| Modify | `src/app/battle-reports/page.tsx` | Null-safe field access for nullable types |
| Modify | `src/app/profile/[profileId]/page.tsx` | Null-safe field access for nullable types |
| Modify | `src/app/seasons/[id]/page.tsx` | Null-safe field access for nullable types |
| Modify | `src/routes.ts` | Added "My Drafts" link to member navigation |

### Approach

#### 1. Database: status column with constraint-based integrity

The `status` column defaults to `'published'` so existing data is unaffected. Rather than relying solely on application-level validation, the `published_fields_required` CHECK constraint guarantees that no published report can have null fields at the database level. This provides a safety net regardless of which code path inserts or updates a report.

#### 2. Server actions: conditional validation

Both `submitBattleReport()` (insert) and `updateBattleReport()` (update) read the `status` field from form data. When `status === 'draft'`, field validation is skipped entirely and only non-empty fields are included in the insert/update payload. When `status === 'published'`, the full existing validation pipeline runs.

#### 3. Form component: reusable for create and edit

`BattleReportForm` accepts optional `defaultValues` (a `BattleReport` object) and `reportId` props. When `reportId` is present, the form operates in edit mode: it calls `updateBattleReport` instead of `submitBattleReport`, pre-populates fields, and shows "Edit Battle Report" as the heading. Both modes share the same dual-button layout and validation logic.

#### 4. Query filtering: defense in depth

Public-facing queries (`getBattleReports`, `getBattleReportsByPlayerId`, etc.) add `.eq('status', 'published')` as an application-level filter. RLS policies also enforce this at the database level. The dual filtering means a bug in one layer doesn't expose drafts.

#### 5. Detail page: graceful null handling

Since the `BattleReport` type now has nullable fields, all display pages use null checks before rendering player names, faction labels, scores, outcomes, and game details. For draft detail views, missing data shows "Not yet assigned" or "Not set" placeholders.

## Key Design Decisions

1. **Default `published` rather than `draft`** — Existing reports stay published with no backfill migration. The form explicitly sets the status via a hidden field, so the default only matters for legacy data.
2. **Database-level constraint for published fields** — The `published_fields_required` CHECK constraint ensures data integrity even if a code path bypasses application validation. This is safer than relying on app logic alone.
3. **Relaxed NOT NULL instead of a separate drafts table** — Keeping drafts and published reports in the same table simplifies queries, RLS, and the transition from draft to published (just an UPDATE). A separate table would require moving rows between tables on publish.
4. **Conditional validation in actions, not the form** — The form always submits all fields. The server action decides whether to validate based on the `status` field. This keeps the form component simple and avoids duplicating validation logic.
5. **Season assigned on publish, not draft save** — The trigger only assigns `season_id` when `status = 'published'`, preventing drafts from being counted in season stats before they're complete.

## Notes

- The `BattleReport` TypeScript type now has all player/game fields as nullable (`string | null`, `number | null`, `Outcome | null`). Any new code that accesses these fields must handle null values.
- The edit page (`/battle-reports/[id]/edit`) works for both drafts and published reports. For published reports, only the reporter and admins can access it.
- Draft count is not currently shown as a badge in the navbar — just a "My Drafts" text link. A badge could be added later if useful.
