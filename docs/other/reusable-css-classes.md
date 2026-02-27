# Reusable CSS Classes

**Epic:** Other
**Type:** Enhancement
**Status:** In Progress

## Summary

Extract repeated Tailwind/DaisyUI class patterns from components and pages into reusable CSS classes in `globals.css`. This reduces duplication across 20+ files, improves styling consistency, and makes future layout changes a single-file edit instead of a multi-file search-and-replace.

## Motivation

The codebase has grown to 20+ page and component files that repeat the same class patterns. For example, the page layout pattern `flex flex-col items-center -mt-72 pt-72 min-h-screen w-full` appears in 17 files. The form fieldset pattern `fieldset bg-base-300 rounded-box p-5` appears in 17 instances. If a layout change is needed (e.g., changing the navbar offset), every file must be edited individually.

The existing `globals.css` already demonstrates this pattern successfully with `.ornament`, `.text-gold`, and `.hero-glow` — this enhancement extends that approach to the most common layout and component patterns.

## Acceptance Criteria

- [x] Repeated class patterns are identified and documented
- [x] Reusable CSS classes are added to `src/app/globals.css` using Tailwind's `@apply` directive
- [x] All page files are updated to use the new layout classes (`.page-layout`, `.page-container`, `.page-content`)
- [x] All form files are updated to use the new form classes (`.form-section`, `.form-grid`, `.form-error`)
- [x] All card/interactive components are updated to use the new classes (`.card-interactive`, `.info-row`)
- [x] Table components updated to use `.data-table`
- [x] Label and empty-state classes applied (`.label-meta`, `.empty-text`)
- [ ] Typography: Remove redundant inline `text-3xl font-bold` from `<h1>` elements (~19 files) — already styled by the `h1` element selector in `globals.css`
- [ ] Typography: Replace inline section-header patterns with `.section-header` class (~6 files)
- [ ] Navigation: Replace inline back-button patterns with `.btn-back` class (~12 files)
- [ ] Build and lint pass

## Approach

### Page Layout

#### `.page-layout`
```css
.page-layout {
  @apply flex flex-col items-center -mt-72 pt-72 min-h-screen w-full;
}
```
- **17 files** — `<main>` wrapper on every page in the app

#### `.page-container`
```css
.page-container {
  @apply w-full px-4 py-12;
}
```
- **20+ instances** — immediate child of `.page-layout`

#### `.page-content`
```css
.page-content {
  @apply mx-auto max-w-4xl;
}
```
- **20+ instances** — max-width content wrapper inside `.page-container`

### Typography

#### `.text-h1`
```css
.text-h1 {
  @apply text-3xl font-bold;
}
```
- **17 files** — main page headings across all pages

#### `.text-h2`
```css
.text-h2 {
  @apply text-xl font-bold;
}
```
- For secondary headings in non-ornament contexts (card titles, section titles)

#### `.text-h3`
```css
.text-h3 {
  @apply text-lg font-semibold;
}
```
- Tertiary headings and sub-section labels

#### `.text-h4`
```css
.text-h4 {
  @apply text-base font-semibold;
}
```
- Smaller section headings

#### `.text-h5`
```css
.text-h5 {
  @apply text-sm font-semibold;
}
```
- Minor headings and label-like text

#### `.text-h6`
```css
.text-h6 {
  @apply text-xs font-semibold uppercase;
}
```
- Smallest heading level, uppercase for emphasis

#### `.text-body`
```css
.text-body {
  @apply text-base text-base-content/70;
}
```
- **10+ instances** — standard body/paragraph text styling

#### `.section-header`
```css
.section-header {
  @apply mb-4 text-sm font-semibold uppercase tracking-widest;
}
```
- **29 instances** — used alongside `.ornament` (e.g., `className="ornament section-header"`)
- Note: `.ornament` is custom CSS (not a Tailwind utility), so it cannot be included via `@apply` and must remain a separate class

#### `.label-meta`
```css
.label-meta {
  @apply text-xs font-medium uppercase text-base-content/50;
}
```
- **8 instances** — battle report and profile cards

#### `.empty-text`
```css
.empty-text {
  @apply text-base-content/50 italic;
}
```
- **5+ instances** — empty state messages

### Forms

#### `.form-section`
```css
.form-section {
  @apply fieldset bg-base-300 rounded-box p-5;
}
```
- **17 instances** — all form pages (profile, battle report, season, admin)

#### `.form-grid`
```css
.form-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1;
}
```
- **13+ instances** — two-column responsive layouts in forms

#### `.form-error`
```css
.form-error {
  @apply mt-1 text-sm text-error;
}
```
- **8+ instances** — form validation error messages

### Cards

#### `.card-interactive`
```css
.card-interactive {
  @apply card bg-base-200 shadow-sm transition-shadow hover:shadow-md;
}
```
- **5+ instances** — members, battle reports, seasons, profile pages

#### `.info-row`
```css
.info-row {
  @apply flex items-center justify-between gap-2 rounded-lg bg-base-300 p-3;
}
```
- **6+ instances** — battle report cards and profile pages

### Tables

#### `.data-table`
```css
.data-table {
  @apply table table-zebra bg-base-200 rounded-box;
}
```
- **3 instances** — leaderboard components

### Buttons & Navigation

#### `.btn-back`
```css
.btn-back {
  @apply btn btn-ghost btn-sm mb-4 -ml-2;
}
```
- **25 instances** — detail/edit pages

### Key Files

| Action | File | Description |
|---|---|---|
| Modify | `src/app/globals.css` | Add all new reusable CSS classes |
| Modify | `src/app/**/page.tsx` (17 files) | Replace inline classes with `.page-layout`, `.page-container`, `.page-content` |
| Modify | All form files (5+ files) | Replace with `.form-section`, `.form-grid`, `.form-error` |
| Modify | Card components (5+ files) | Replace with `.card-interactive` |
| Modify | Section headers (20+ instances) | Replace with `.section-header` |
| Modify | Back buttons (25 instances) | Replace with `.btn-back` |
| Modify | Page headings (17+ files) | Replace `text-3xl font-bold` with `.text-h1` |
| Modify | Body text (10+ instances) | Replace paragraph styling with `.text-body` |

### Implementation Steps

1. **Add all CSS classes to `globals.css`** — Define all classes in one batch, grouped by UI component
2. **Page Layout** — Update all pages with `.page-layout`, `.page-container`, `.page-content`
3. **Typography** — Update headings with `.text-h1`–`.text-h6`, paragraphs with `.text-body`, section headers with `.section-header`
4. **Forms** — Update with `.form-section`, `.form-grid`, `.form-error`
5. **Cards** — Update with `.card-interactive`, `.info-row`
6. **Tables** — Update with `.data-table`
7. **Buttons & Navigation** — Update with `.btn-back`
8. **Visual verification** — Check each page for regressions
9. **Build and lint** — Ensure no errors

## Key Decisions

1. **Use `@apply` over CSS-in-JS** — Tailwind's `@apply` keeps styles in CSS and allows one-line class references in JSX. This aligns with the existing pattern in `globals.css` (`.ornament`, `.text-gold`, etc.).

2. **Keep DaisyUI component classes inline** — Classes like `btn btn-primary`, `badge badge-success`, and `input input-bordered` are DaisyUI semantic components and should stay inline. Only extract **repeated combinations** of utility classes.

3. **Grouped by UI component** — Classes are organized by the component they style (page layout, typography, forms, cards, etc.) for clarity and maintainability in `globals.css`.

4. **No functional changes** — This is purely a styling refactor. No behavior, data flow, or component structure changes.

## Notes

- The `.ornament` class in `globals.css` is the precedent for this approach — it's used 20+ times and works well
- Tailwind v4 uses `@apply` the same way as v3, so no migration concerns
- After this refactor, changing the page layout (e.g., adjusting the navbar offset) becomes a single-line change in `globals.css` instead of editing 17 files
- Some patterns like `.section-header` build on existing custom classes (`.ornament`) — this is intentional layering
- Typography classes were added as both element selectors (`h1`, `p`) and class selectors (`.text-h1`, `.text-body`), so `<h1>` and `<p>` elements are automatically styled — the inline classes on those elements are now redundant but not harmful

### Remaining Work

3 categories of inline patterns still need to be replaced with their reusable classes:

1. **`text-3xl font-bold` on `<h1>` elements** (~19 files) — These are now redundant since the `h1` element selector in `globals.css` applies the same styles. Remove the inline classes.
2. **`mb-4 text-sm font-semibold uppercase tracking-widest`** (~6 files) — Replace with `section-header` class. Affected files: `create-profile-form.tsx`, `admin-edit-profile-form.tsx`, `battle-report-form.tsx`, `edit-profile-form.tsx`, `season-form.tsx`, and 1 more.
3. **`btn btn-ghost btn-sm mb-4 -ml-2`** (~12 files) — Replace with `btn-back` class. Affected files: all detail/edit page files across admin, profile, seasons, and battle-reports.
