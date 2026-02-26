# Reusable CSS Classes

**Epic:** UI & Styling
**Type:** Enhancement
**Status:** In Progress

## Summary

Extract repeated Tailwind/DaisyUI class patterns from components and pages into reusable CSS classes in `globals.css`. This reduces duplication across 20+ files, improves styling consistency, and makes future layout changes a single-file edit instead of a multi-file search-and-replace.

## Motivation

The codebase has grown to 20+ page and component files that repeat the same class patterns. For example, the page layout pattern `flex flex-col items-center -mt-72 pt-72 min-h-screen w-full` appears in 17 files. The form fieldset pattern `fieldset bg-base-300 rounded-box p-5` appears in 17 instances. If a layout change is needed (e.g., changing the navbar offset), every file must be edited individually.

The existing `globals.css` already demonstrates this pattern successfully with `.ornament`, `.text-gold`, and `.hero-glow` — this enhancement extends that approach to the most common layout and component patterns.

## Acceptance Criteria

- [ ] Repeated class patterns are identified and documented
- [ ] Reusable CSS classes are added to `src/app/globals.css` using Tailwind's `@apply` directive
- [ ] All page files are updated to use the new classes
- [ ] All form files are updated to use the new classes
- [ ] All card/interactive components are updated to use the new classes
- [ ] Visual output is identical before and after (no visual regressions)
- [ ] Build and lint pass

## Approach

### Phase 1 — Critical Patterns (highest repetition)

#### `.page-layout`
```css
.page-layout {
  @apply flex flex-col items-center -mt-72 pt-72 min-h-screen w-full;
}
```
- **17 files** use this exact pattern as the `<main>` wrapper
- Every page in the app

#### `.page-container`
```css
.page-container {
  @apply w-full px-4 py-12;
}
```
- **20+ instances** — the immediate child of `.page-layout`

#### `.page-content`
```css
.page-content {
  @apply mx-auto max-w-4xl;
}
```
- **20+ instances** — max-width content wrapper inside `.page-container`

#### `.form-section`
```css
.form-section {
  @apply fieldset bg-base-300 rounded-box p-5;
}
```
- **17 instances** across all form pages (profile, battle report, season, admin)

#### `.card-interactive`
```css
.card-interactive {
  @apply card bg-base-200 shadow-sm transition-shadow hover:shadow-md;
}
```
- **5+ instances** in members, battle reports, seasons, profile pages

### Phase 2 — High-Value Patterns

#### `.section-header`
```css
.section-header {
  @apply ornament mb-4 text-sm font-semibold uppercase tracking-widest;
}
```
- **20+ instances** — always the same combo with `.ornament`

#### `.form-grid`
```css
.form-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1;
}
```
- **13+ instances** in forms for two-column responsive layouts

#### `.info-row`
```css
.info-row {
  @apply flex items-center justify-between gap-2 rounded-lg bg-base-300 p-3;
}
```
- **6+ instances** in battle report cards and profile pages

#### `.btn-back`
```css
.btn-back {
  @apply btn btn-ghost btn-sm mb-4 -ml-2;
}
```
- **25 instances** across detail/edit pages

#### `.label-meta`
```css
.label-meta {
  @apply text-xs font-medium uppercase text-base-content/50;
}
```
- **8 instances** in battle report and profile cards

### Phase 3 — Medium-Value Patterns

#### `.data-table`
```css
.data-table {
  @apply table table-zebra bg-base-200 rounded-box;
}
```
- **3 instances** in leaderboard components

#### `.form-error`
```css
.form-error {
  @apply mt-1 text-sm text-error;
}
```
- **8+ instances** in form validation error messages

#### `.empty-text`
```css
.empty-text {
  @apply text-base-content/50 italic;
}
```
- **5+ instances** for empty state messages

### Key Files

| Action | File | Description |
|---|---|---|
| Modify | `src/app/globals.css` | Add all new reusable CSS classes |
| Modify | `src/app/**/page.tsx` (17 files) | Replace inline classes with `.page-layout`, `.page-container`, `.page-content` |
| Modify | All form files (5+ files) | Replace with `.form-section`, `.form-grid`, `.form-error` |
| Modify | Card components (5+ files) | Replace with `.card-interactive` |
| Modify | Section headers (20+ instances) | Replace with `.section-header` |
| Modify | Back buttons (25 instances) | Replace with `.btn-back` |

### Implementation Steps

1. **Add all CSS classes to `globals.css`** — Define all classes in one batch at the end of the file
2. **Phase 1 replacements** — Update page layouts, containers, form sections, and interactive cards
3. **Phase 2 replacements** — Update section headers, form grids, info rows, back buttons, meta labels
4. **Phase 3 replacements** — Update data tables, form errors, empty text
5. **Visual verification** — Check each page for regressions
6. **Build and lint** — Ensure no errors

## Key Decisions

1. **Use `@apply` over CSS-in-JS** — Tailwind's `@apply` keeps styles in CSS and allows one-line class references in JSX. This aligns with the existing pattern in `globals.css` (`.ornament`, `.text-gold`, etc.).

2. **Keep DaisyUI component classes inline** — Classes like `btn btn-primary`, `badge badge-success`, and `input input-bordered` are DaisyUI semantic components and should stay inline. Only extract **repeated combinations** of utility classes.

3. **Phase-based rollout** — Start with the highest-impact patterns (page layout, form sections) to get immediate value. Lower-priority patterns can be done in the same PR or deferred.

4. **No functional changes** — This is purely a styling refactor. No behavior, data flow, or component structure changes.

## Notes

- The `.ornament` class in `globals.css` is the precedent for this approach — it's used 20+ times and works well
- Tailwind v4 uses `@apply` the same way as v3, so no migration concerns
- After this refactor, changing the page layout (e.g., adjusting the navbar offset) becomes a single-line change in `globals.css` instead of editing 17 files
- Some patterns like `.section-header` build on existing custom classes (`.ornament`) — this is intentional layering
