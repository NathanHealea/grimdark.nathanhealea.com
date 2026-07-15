# Shared UI Primitives

**Epic:** UI Refactor
**Type:** Refactor
**Status:** Todo
**Merge Into:** epic/ui-refactor

## Summary

Establish the shadcn `src/components/ui/*` primitive layer plus its matching `src/styles/components/*.css` stylesheets, replacing every DaisyUI primitive class used across the app. JSX keeps DaisyUI-style semantic class names (`btn`, `card`, `badge`); the underlying implementation is shadcn wrappers (`cn('btn', className)`) styled via `@apply` on theme tokens. Depends on doc 01.

## Acceptance Criteria

- [ ] Each primitive has a thin wrapper in `src/components/ui/` (where a component is warranted) and a dedicated stylesheet in `src/styles/components/`:
  - [ ] `button` — `btn`, `btn-primary/secondary/outline/ghost/error/link/sm/lg/xs/circle`
  - [ ] `card` — `card`, `card-body`, `card-title`, plus `card-interactive`
  - [ ] `badge` — `badge`, `badge-outline/soft/sm/success/warning/error/ghost`
  - [ ] `alert` — `alert`, `alert-error/success/warning/info`
  - [ ] `input` — `input`, `input-bordered` (native `<input>`)
  - [ ] `textarea` — `textarea`, `textarea-bordered` (native `<textarea>`)
  - [ ] `select` — `select`, `select-bordered` (native `<select>`, kept per decision)
  - [ ] `checkbox` — `.checkbox` (native `<input type="checkbox">`, kept per decision)
  - [ ] `label` — `label` (Radix Label)
  - [ ] `avatar` — `avatar`, `avatar-placeholder` (Radix Avatar)
  - [ ] `separator` — replaces `divider` (Radix Separator; text-in-divider variant handled with a small custom rule)
  - [ ] `spinner` — replaces DaisyUI `loading`/`loading-spinner`/`loading-sm` (CSS-animated, no new icon dep)
  - [ ] `link` — `link`, `link-primary`, `link-hover`
  - [ ] `table` — `table`, `table-zebra`, `data-table` (hand-rolled, grimify-style)
  - [ ] `tooltip` — keep existing custom portal tooltip; align its classes to tokens (optional Radix Tooltip swap deferred)
- [ ] Every stylesheet is added under `layer(components)` in `globals.css` and carries a header (component name, DaisyUI reference, class inventory).
- [ ] No inline Tailwind utilities in JSX for these primitives except layout one-offs; visual output matches `main`.
- [ ] `npm run build` + `npm run lint` pass; primitives render identically in a scratch smoke test.

## Approach

1. `npx shadcn@latest add button card badge alert input textarea label avatar separator tooltip` where a clean shadcn source exists, then **retarget** each generated component to apply the semantic class (`cn('btn', className)`) and move its styling into `src/styles/components/<name>.css` via `@apply`. For native-element primitives (select, checkbox, input, textarea) keep the native element and style the semantic class.
2. Build `button.css` using a `--btn-color` custom property consumed by `color-mix()` (grimify pattern) so color × style variants compose without compound rules.
3. Author `spinner` and `link` by hand (no shadcn source). Reproduce the current spinner size/animation.
4. Keep the existing custom `tooltip.tsx` behavior; only reconcile its classes to tokens.

### Affected Files

| Action | File | Changes |
|---|---|---|
| Create | `src/components/ui/{button,card,badge,alert,input,textarea,label,avatar,separator,tooltip}.tsx` | thin semantic-class wrappers |
| Create | `src/styles/components/{button,card,badge,alert,input,textarea,select,checkbox,label,avatar,separator,spinner,link,table}.css` | per-component `@apply` styles |
| Modify | `src/app/globals.css` | add `layer(components)` imports |

### Risks & Considerations

- Native select/checkbox styling must match DaisyUI's appearance closely (focus ring, size) to preserve the look.
- The `table`/`data-table` alias is used by leaderboard and guides — verify zebra striping and rounded container match.
- Do not migrate consumers yet; only introduce the primitives. Consumers migrate in docs 03–07.

## Notes

Consumers still using raw DaisyUI classes keep working because `daisyui` stays installed until the final domain doc.
