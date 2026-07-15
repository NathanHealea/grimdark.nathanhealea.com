# Home, Leaderboard, Seasons & Guides

**Epic:** UI Refactor
**Type:** Refactor
**Status:** Todo
**Merge Into:** epic/ui-refactor

## Summary

Migrate the remaining public/domain surfaces: the home page (including the only use of DaisyUI `stats`), leaderboard tables, seasons pages, and guides. After this doc, the `daisyui` dependency is removed. Depends on docs 01–03.

## Acceptance Criteria

- [ ] `app/page.tsx` migrated: the DaisyUI `stats`/`stat-value`/`stat-desc` block is rebuilt as **Card stat tiles** (responsive grid of `card` with a description label over a large value) with the same numbers/labels; `btn`/`btn-lg`/`btn-primary`, `join`/`join-item`, `select`, `table`, `skeleton`, and `hero-glow` preserved.
- [ ] `modules/leaderboard/components/leaderboard-section.tsx` + `leaderboard-table.tsx` migrated: `card`/`card-body`, `data-table`, `btn`/`btn-ghost`/`btn-sm`, `join` → primitives/aliases.
- [ ] `app/leaderboard/page.tsx` + `loading.tsx` migrated (`card`, `skeleton`, `table`, `page-*`).
- [ ] Seasons migrated: `app/seasons/page.tsx`, `[id]/page.tsx`, `[id]/season-roster.tsx`, `[id]/join-season-form.tsx` — `badge`/`badge-success`, `card`/`card-interactive`, `btn` variants, `select`/`select-bordered`, `form-error`, `info-row`, `label-meta`, `section-header`, `empty-text` → primitives/aliases.
- [ ] Guides migrated: `app/guides/page.tsx`, `[slug]/page.tsx`, `modules/guides/components/guide-content.tsx` (`data-table`), `modules/markdown/components/markdown-editor.tsx` (`btn`, `join`, `form-error`).
- [ ] Members migrated: `app/members/page.tsx` + `loading.tsx` (`badge`, `card-interactive`, `skeleton`, `empty-text`).
- [ ] `app/unauthorized/page.tsx` migrated (`btn-primary`, `page-*`).
- [ ] **`daisyui` removed from `package.json`** and no DaisyUI classes remain in non-admin code (admin handled in doc 07). Global grep for DaisyUI primitives returns only doc-07 admin files. `npm run build` + `npm run lint` pass; all pages render identically to `main`.

## Approach

1. Rebuild the home stat block as Card tiles (grimify pattern: `CardDescription` label over `text-2xl` value in a responsive grid).
2. Migrate leaderboard (section + table), then seasons, then guides/markdown, then members + unauthorized.
3. Once every non-admin surface is migrated and doc 07 is complete, remove `daisyui` and confirm the build with a fresh install.

### Affected Files

| Action | File | Changes |
|---|---|---|
| Modify | `src/app/page.tsx` | stats → Card tiles; other DaisyUI → primitives |
| Modify | `src/modules/leaderboard/components/*.tsx` | DaisyUI → primitives/aliases |
| Modify | `src/app/{leaderboard,seasons,guides,members,unauthorized}/**/*.tsx` | DaisyUI → primitives/aliases |
| Modify | `src/modules/{guides,markdown}/components/*.tsx` | DaisyUI → primitives |
| Modify | `package.json` | remove `daisyui` (after doc 07) |

### Risks & Considerations

- Home stat tiles are the one intentional structural change on a public page — match spacing/typography to keep the visual weight similar.
- Removing `daisyui` is gated on doc 07 also being complete; coordinate the removal as the epic's final cleanup.
