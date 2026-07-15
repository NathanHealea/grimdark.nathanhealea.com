# shadcn Setup & Theme Foundation

**Epic:** UI Refactor
**Type:** Refactor
**Status:** Todo
**Merge Into:** epic/ui-refactor

## Summary

Initialize shadcn/ui on the existing Tailwind CSS v4 setup, replace the DaisyUI plugin/theme in `globals.css` with shadcn CSS-variable theme tokens that reproduce the current dark-only **grimdark** look exactly, scaffold the `src/styles/components/` per-component stylesheet directory, and codify the migration's standing development standards in `CLAUDE.md`. This is the foundation every other doc in the epic depends on.

## Acceptance Criteria

- [ ] `shadcn` is initialized: `components.json` exists (style, `rsc: true`, `tailwind.config: ""` for v4, `css: src/app/globals.css`, `cssVariables: true`, aliases for `@/components/ui` and `@/lib/utils`, `iconLibrary: lucide` is irrelevant — we keep heroicons).
- [ ] Dependencies added: `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, and Radix primitives needed by kept-native components (`@radix-ui/react-label`, `@radix-ui/react-avatar`, `@radix-ui/react-separator`). `daisyui` remains installed until the last domain doc removes it (kept during migration so un-migrated pages keep rendering).
- [ ] `src/lib/utils.ts` exports `cn()` = `twMerge(clsx(inputs))`.
- [ ] `globals.css` no longer registers the DaisyUI `@plugin`; it imports `tailwindcss` + `tw-animate-css`, defines `@theme inline` token mappings and a `--radius`-derived radius scale, and declares `:root` semantic tokens in OKLch that visually match the grimdark palette. Dark is the default (the app is dark-only today).
- [ ] The existing `@apply` alias classes (`page-layout`, `page-container`, `page-content`, `section-header`, `card-interactive`, `data-table`, `form-section`, `form-grid`, `form-error`, `btn-back`, `empty-text`, `label-meta`, `info-row`, custom `.checkbox`) are rewritten against shadcn tokens and moved into appropriate `src/styles/components/*.css` files (or a `layout.css`), no longer referencing DaisyUI primitives/tokens.
- [ ] `src/styles/components/` exists; each component stylesheet is imported from `globals.css` with `layer(components)`.
- [ ] `CLAUDE.md` documents the standing standards: DaisyUI→shadcn mapping table, the semantic-class + `@apply` + one-file-per-component conventions, the `src/styles/components/` layout, the token/theme system, and the three kept-as-is decisions (Headless UI dropdowns, native select/checkbox, Heroicons).
- [ ] `npm run build` and `npm run lint` pass. The app renders with no visible change (custom `.hero-glow`, `.scroll-banner-track`, `.text-gold`, `.stat-num` utilities preserved).

## Approach

### 1. Dependencies & shadcn init

- Add runtime deps `class-variance-authority clsx tailwind-merge tw-animate-css @radix-ui/react-label @radix-ui/react-avatar @radix-ui/react-separator`.
- Run `npx shadcn@latest init`. On Tailwind v4 there is no `tailwind.config.js`; confirm `components.json` has `tailwind.config: ""` and `css: "src/app/globals.css"`.
- Create `src/lib/utils.ts` with `cn()`. Register the `@/components/ui` alias.

### 2. Token system in `globals.css`

Reproduce the grimdark DaisyUI theme as shadcn tokens. Current DaisyUI values → shadcn tokens (convert each hex to OKLch at implementation):

| grimdark (DaisyUI) | shadcn token |
|---|---|
| `base-100 #0a0a0a` | `--background` |
| `base-200 #141414` | `--card`, `--popover` |
| `base-300 #2a2a2a` | `--muted`, `--secondary`, `--border`, `--input` |
| `base-content #e5e5e5` | `--foreground`, `--card-foreground` |
| `primary #c9a84c` (gold) | `--primary` (+ derived `--ring`) |
| `neutral #141414` | `--muted` companion |
| `error #8b2020` | `--destructive` |
| `success #4a7c59` / `warning #a36b2b` / `info #4a6a8b` | custom `--success` / `--warning` / `--info` tokens |
| `radius-field 0.5rem` / `radius-box 1rem` | `--radius: 0.5rem` + `--radius-lg`/scale for `1rem` |
| `border 2px` | preserved per-component (`border-2` in `@apply`) |
| `Georgia, serif` body | keep `body { font-family: Georgia, serif }` |

- Add `@theme inline` mapping (`--color-primary: var(--primary)`, etc.) so Tailwind color utilities resolve to the tokens.
- Keep the custom utilities that are **not** DaisyUI (`.text-gold`, `.ornament`, `.stat-num`, `.hero-glow`, `.scroll-banner-track`, `.lb-row`, `.faction-banner`, `.pulse-dot`, `.ticker-track` + keyframes) — reroute their `var(--color-*)` references to the new tokens.

### 3. Migrate the `@apply` aliases

Move each semantic alias into a per-component file under `src/styles/components/` and rewrite its `@apply` to shadcn tokens (`bg-card`/`bg-muted` for `bg-base-200/300`, `text-muted-foreground` for `text-base-content/70`, `text-destructive` for `text-error`, `rounded-lg` for `rounded-box`). Import all of them from `globals.css` under `layer(components)`.

### 4. `CLAUDE.md` standards (deliverable)

Add a **UI / styling standards** section: the mapping table, the "semantic DaisyUI-style class name in JSX, defined via `@apply` in `src/styles/components/<name>.css`" rule, the thin-`components/ui` wrapper pattern (`cn('btn', className)`), the one-file-per-component rule, the token/theme reference, and the kept-as-is decisions.

### Affected Files

| Action | File | Changes |
|---|---|---|
| Create | `components.json` | shadcn config for Tailwind v4 |
| Create | `src/lib/utils.ts` | `cn()` helper |
| Modify | `src/app/globals.css` | remove DaisyUI plugin/theme; add shadcn tokens, `@theme inline`, `layer(components)` imports |
| Create | `src/styles/components/*.css` | homes for migrated `@apply` aliases (layout, form, table, button helpers) |
| Modify | `package.json` | add deps |
| Modify | `CLAUDE.md` | standing UI/styling standards + mapping |

### Risks & Considerations

- **Visual drift** from hex→OKLch conversion. Mitigate by comparing key screens against `main` before/after; tune OKLch until it matches.
- DaisyUI must stay installed through the migration so un-migrated routes keep working; removal is the final step of the last domain doc.
- `globals.css` touches nearly every page — build and smoke-test the whole app after this doc.

## Notes

Reference project for conventions and the OKLch/token approach: `../grimify` (`grimify.app`) — see its `src/styles/`, `globals.css`, `components.json`, and `src/lib/utils.ts`.
