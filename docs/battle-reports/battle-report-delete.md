# Battle Report Delete

**Epic:** Battle Reports
**Type:** Feature
**Status:** In Progress

## Summary

Add a "Delete" action menu item to the Battle Report Management admin page. Admins can delete any battle report directly from the table's action menu, following the same pattern used by the Season Management page (confirm dialog, server action, page refresh).

## Acceptance Criteria

- [x] The action menu on each battle report row includes a "Delete Report" item styled as danger (red)
- [x] Clicking "Delete Report" shows a browser confirmation dialog before proceeding
- [x] Confirming the dialog deletes the battle report from the database
- [x] The page refreshes automatically after successful deletion
- [x] An error alert is shown if the deletion fails
- [x] Only admins can delete battle reports (server-side role check)
- [x] Non-admin users cannot invoke the delete server action

## Implementation

### Key Files

| Action | File                                                     | Description                                                   |
| ------ | -------------------------------------------------------- | ------------------------------------------------------------- |
| Create | `src/app/admin/battle-reports/battle-report-actions.tsx` | Client component wrapping ActionsMenu with delete handler     |
| Modify | `src/app/admin/battle-reports/page.tsx`                  | Replace inline ActionsMenu with BattleReportActions component |
| Modify | `src/app/battle-reports/[id]/edit/actions.ts`            | Add `deleteBattleReport` server action                        |

### Approach

#### 1. Add `deleteBattleReport` server action

Add a new exported async function to `src/app/battle-reports/[id]/edit/actions.ts`.

Follow the `deleteSeason` pattern from `src/app/admin/seasons/actions.ts:131-167`:

- Accept `reportId: string` parameter
- Return `Promise<{ error?: string }>`
- Authenticate with `supabase.auth.getUser()`
- Check admin role via `hasRole(user.id, 'admin')`
- Delete from `battle_reports` where `id = reportId`
- Call `revalidatePath('/', 'layout')` on success

Unlike season deletion, battle reports have no child records to clean up — it's a straightforward delete.

```
export async function deleteBattleReport(reportId: string): Promise<{ error?: string }>
```

#### 2. Create `BattleReportActions` client component

Create `src/app/admin/battle-reports/battle-report-actions.tsx` modeled on `src/app/admin/seasons/season-actions.tsx`.

Props:

- `reportId: string` — the battle report UUID
- `reportLabel: string` — display text for the confirmation dialog (e.g. attacker vs defender or date)

The component:

- Is a `'use client'` component
- Uses `useRouter` from `next/navigation`
- Defines `handleDelete` that calls `confirm()`, then `deleteBattleReport()`, then `router.refresh()`
- Renders `ActionsMenu` with three items:
  - `{ label: 'View Report', href: '/battle-reports/{id}' }`
  - `{ label: 'Edit Report', href: '/battle-reports/{id}/edit' }`
  - `{ label: 'Delete Report', onClick: handleDelete, variant: 'danger' }`

#### 3. Update admin battle reports page

In `src/app/admin/battle-reports/page.tsx`:

- Import `BattleReportActions` instead of `ActionsMenu`
- Replace the inline `<ActionsMenu items={[...]} />` (lines 176-181) with `<BattleReportActions>`
- Pass `reportId={report.id}` and a `reportLabel` built from the row data (e.g. attacker name, date, or a fallback)

## Key Design Decisions

1. **Admin-only deletion** — Only admins can delete battle reports, matching the season delete pattern. The original reporter cannot delete their own published report to preserve data integrity.
2. **Hard delete** — Battle reports are permanently removed. There are no child records referencing battle reports, so no cascading cleanup is needed.
3. **Browser confirm dialog** — Uses the native `confirm()` for simplicity, consistent with season deletion. No need for a custom modal at this scale.
4. **Server action in existing file** — The delete action is added to the existing `src/app/battle-reports/[id]/edit/actions.ts` file rather than creating a new file, keeping battle report mutations co-located.

## Notes

- The `ActionsMenu` component already supports `variant: 'danger'` for button items — no changes needed to the shared component.
- The battle report `id` column is a UUID (`string`), unlike seasons which use `number` IDs.
