# Battle Reports & Factions Domain

**Epic:** UI Refactor
**Type:** Refactor
**Status:** Todo
**Merge Into:** epic/ui-refactor

## Summary

Migrate the battle-report and faction feature surfaces off DaisyUI, including the largest form in the app (`battle-report-form.tsx`, ~1150 lines). Depends on docs 01–03.

## Acceptance Criteria

- [ ] `modules/battle-report/components/battle-report-form.tsx` migrated: `alert`/`alert-info`, `btn` variants, `card`, `checkbox`, `input`/`input-bordered`, `label`, `form-section`, `form-grid`, `form-error`, `label-meta`, `section-header`, `loading` → primitives. All conditional/multi-step field logic and validation unchanged.
- [ ] `modules/faction/components/faction-selector.tsx` migrated: `btn`/`btn-error`/`btn-outline`/`btn-xs`, `select`/`select-bordered`, `form-error` → primitives (native select kept).
- [ ] Battle-report routes migrated: `battle-reports/page.tsx` (feed), `drafts/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`, `submit/page.tsx` — `badge` variants, `card`/`card-body`/`card-title`/`card-interactive`, `btn-back`, `info-row`, `label-meta`, `section-header`, `empty-text`, `link`/`link-hover` → primitives/aliases.
- [ ] Draft/warning badges, attacker/defender layout, score displays render identically to `main`. Form submit + edit flows behave exactly as before. `npm run build` + `npm run lint` pass.

## Approach

1. Migrate `battle-report-form.tsx` carefully in sections (it is the highest-risk file) — verify each field group renders before moving on.
2. Migrate `faction-selector.tsx` (used inside the form and profile).
3. Migrate the battle-report route pages (feed, detail, drafts, submit, edit).

### Affected Files

| Action | File | Changes |
|---|---|---|
| Modify | `src/modules/battle-report/components/battle-report-form.tsx` | DaisyUI → primitives (largest change) |
| Modify | `src/modules/faction/components/faction-selector.tsx` | DaisyUI → primitives |
| Modify | `src/app/battle-reports/**/*.tsx` | DaisyUI → primitives/aliases |

### Risks & Considerations

- `battle-report-form.tsx` is the single biggest risk in the epic — its size and conditional field logic demand incremental verification.
- Faction selector adds/removes rows dynamically; verify the add/remove `btn-xs` controls and validation errors.
