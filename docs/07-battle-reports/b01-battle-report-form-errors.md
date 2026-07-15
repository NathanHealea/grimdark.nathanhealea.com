# Battle Report Form Error Display

**Epic:** Battle Reports
**Type:** Bug
**Status:** Todo
**Severity:** Medium

## Description

When submitting a battle report with invalid player data (or other field errors), the form shows no error indicators. The form appears to freeze — no error banner at the top and no per-field error messages. This affects both the submit and edit forms.

## Steps to Reproduce

1. Navigate to `/battle-reports/submit`
2. Fill in some fields but leave a required player field invalid (e.g., set attacker and defender to the same player, or leave a required field empty)
3. Click "Submit Battle Report" (with status set to Published)
4. Observe: the form does nothing — no error messages, no visual feedback

## Expected Behavior

- A global error alert should appear at the top of the form indicating submission failed
- Each field with a validation error should display an inline error message below it
- Fields with errors should be visually highlighted (red border via `input-error` / `select-error`)

## Actual Behavior

The form silently does nothing. The submit button does not show a loading state, and no errors are rendered. The user has no indication of what went wrong.

## Root Cause

The battle report form (`src/modules/battle-report/components/battle-report-form.tsx`) has a **client-side pre-flight validation** in `handleSubmit()` that catches errors before the server action runs:

```typescript
if (status === 'published') {
  const hasError =
    validateEventDate(values.event_date) ||
    validatePlayerId(values.attacker_id) ||
    // ... all validations

  if (hasError) {
    formRef.current?.reportValidity() // <-- problem
    return // <-- prevents server action from running
  }
}
```

The issue is two-fold:

1. **`reportValidity()` doesn't know about custom validators** — The validation functions (`validatePlayerId`, `validateScore`, etc.) return error strings, but these are never set as HTML5 `customValidity` on the actual form elements. So `reportValidity()` has nothing to show unless the field has a native HTML constraint (like `required`). Most fields are `<select>` elements or controlled inputs without `required` attributes.

2. **Early return prevents server action** — Because `handleSubmit` returns early, `formAction(formData)` is never called. The `state` from `useActionState` never gets updated with error values, so the error rendering UI (`state?.errors?.field_name` and `state?.error`) never triggers.

The server action (`submitBattleReport`) already has proper validation that returns `{ errors: { field_name: 'message' } }`, and the form JSX already has proper error rendering for `state?.errors` — but this code path is never reached because the client-side pre-flight intercepts first.

## Fix

Remove the client-side pre-flight validation from `handleSubmit()` and let the server action handle all validation. The server action already validates the same fields and returns proper error state that the form UI renders correctly.

This approach:
- Matches the pattern used by the season form (no client-side pre-flight)
- Keeps validation logic in one place (server action)
- Ensures `state?.errors` gets populated so the existing error UI renders
- Preserves the same-player check (move from client-side to server-side, or keep as server-side which already exists)

### Implementation Steps

1. **Remove client-side pre-flight validation** from `battle-report-form.tsx` `handleSubmit()` — Remove the `if (status === 'published')` validation block that calls `reportValidity()` and returns early. Keep the `startTransition(() => formAction(formData))` call.

2. **Remove `samePlayerError` local state** — The server action already has the same-player check that returns `{ errors: { defender_id: '...' } }`. Remove the client-side duplicate and the local `samePlayerError` state.

3. **Clean up refs and unused validation imports** — Remove `formRef` if no longer needed. Remove any unused validator imports from the form component.

4. **Verify error rendering works for all fields** — Confirm each field in the JSX has the `state?.errors?.field_name` check and `form-error` rendering. The existing code already has this, but verify completeness.

5. **Test both submit and edit forms** — Both use the same `BattleReportForm` component with different actions, so the fix applies to both.

### Files Changed

- **`src/modules/battle-report/components/battle-report-form.tsx`** — Remove client-side pre-flight validation, remove `samePlayerError` state, clean up unused refs/imports

## Notes

- The server actions (`submit/actions.ts` and `edit/actions.ts`) already have comprehensive validation and return proper `{ errors }` state — no changes needed there
- The form JSX already renders field-level errors via `state?.errors?.field_name` and `form-error` class — no UI changes needed
- The profile edit form uses a different pattern (`setCustomValidity` on refs) which works because it properly sets validity on the DOM elements. The battle report form's `reportValidity()` call doesn't work because it never sets custom validity.
- Draft mode: the server action skips most validation for drafts (only validates status), so removing the client-side check doesn't change draft behavior
