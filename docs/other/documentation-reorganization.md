# Documentation Reorganization

**Epic:** Other
**Type:** Enhancement
**Status:** Completed

<!--
Status values:
  Todo        — Not started, no acceptance criteria completed
  In Progress — Partially implemented, some acceptance criteria completed
  Completed   — Fully implemented, all acceptance criteria completed

Type values:
  Feature     — New functionality
  Bug         — Defect fix
  Enhancement — Improvement to existing functionality
-->

## Summary

Reorganize the project documentation from a type-based structure (`features/`, `bugs/`, `enhancements/`) to a Jira/Agile epic-based structure where each epic from `docs/overview.md` gets its own top-level directory under `docs/`. Every document gets `Epic` and `Type` metadata fields. Documents that don't belong to an epic go in `docs/other/`.

## Motivation

The current structure nests all work items under `docs/features/`, `docs/bugs/`, and `docs/enhancements/`, grouping by document type rather than by product area. This makes it harder to see all work related to a specific epic at a glance. A Jira/Agile-style structure organized by epic improves discoverability and aligns documentation with how work is planned and tracked in `docs/overview.md`.

## Acceptance Criteria

- [x] Epic directories exist at `docs/` root: `authentication-and-user-accounts/`, `league-information/`, `member-profiles/`, `factions/`, `battle-reports/`, `standings-and-leaderboard/`, `other/`
- [x] `docs/features/`, `docs/bugs/`, `docs/enhancements/` directories are removed
- [x] All documents have `Epic` and `Type` metadata fields
- [x] `Type` values are: `Feature`, `Bug`, or `Enhancement`
- [x] Documents not belonging to an epic are in `docs/other/`
- [x] All links in `docs/overview.md` point to the new paths
- [x] Templates in `docs/contributions/templates/` include `Epic` and `Type` fields
- [x] `/document` and `/plan` commands reference the new directory structure
- [x] Inconsistent status values are normalized (`Done` → `Completed`)
- [x] `docs/contributions/` directory is unchanged (stays as-is)

## Approach

### Phase 1: Update templates

Update all three templates in `docs/contributions/templates/` to include `Epic` and `Type` metadata fields.

| Template | Changes |
|---|---|
| `feature.md` | Add `**Type:** Feature` field |
| `bug.md` | Replace `**Area:**` with `**Epic:**`, add `**Type:** Bug` |
| `enhancement.md` | Replace `**Area:**` with `**Epic:**`, add `**Type:** Enhancement` |

### Phase 2: Create new directory structure

Create epic directories at `docs/` root:

```
docs/
  authentication-and-user-accounts/
  league-information/
  member-profiles/
  factions/
  battle-reports/
  standings-and-leaderboard/
  other/
```

### Phase 3: Move and update documents

Move each document from its current location to the new epic directory. For each document:

1. Move the file to the corresponding epic directory
2. Add `**Type:** Feature|Bug|Enhancement` metadata field
3. Ensure `**Epic:**` field is present and correct
4. Normalize status values (`Done` → `Completed`)

#### Document move map

| Current path | New path | Type | Epic |
|---|---|---|---|
| `features/authentication-and-user-accounts/*.md` (5 files) | `authentication-and-user-accounts/*.md` | Feature | Authentication & User Accounts |
| `features/league-information/*.md` (4 files) | `league-information/*.md` | Feature | League Information |
| `features/member-profiles/*.md` (9 files) | `member-profiles/*.md` | Feature | Member Profiles |
| `features/factions/*.md` (4 files) | `factions/*.md` | Feature | Factions |
| `features/battle-reports/*.md` (5 files) | `battle-reports/*.md` | Feature | Battle Reports |
| `features/standings-and-leaderboard/*.md` (3 files) | `standings-and-leaderboard/*.md` | Feature | Standings & Leaderboard |
| `features/user-management/admin-user-management.md` | `other/admin-user-management.md` | Feature | Other |
| `features/mobile-friendly/responsive-navbar.md` | `other/responsive-navbar.md` | Feature | Other |
| `bugs/navbar-shows-signin-after-profile-setup.md` | `other/navbar-shows-signin-after-profile-setup.md` | Bug | Other |
| `enhancements/season-wysiwyg-editor.md` | `other/season-wysiwyg-editor.md` | Enhancement | Other |

#### Documents needing fixes

| Document | Fix |
|---|---|
| `battle-report-detail-view.md` | Status `Done` → `Completed` |
| `battle-report-feed.md` | Status `Done` → `Completed` |
| `submit-battle-report.md` | Status `Done` → `Completed` |
| `unlinked-profiles.md` | Add missing `Epic`, `Type`, `Status` metadata |
| `navbar-shows-signin-after-profile-setup.md` | Add `Epic: Other`, add `Type: Bug` |
| `season-wysiwyg-editor.md` | Replace `Area` with `Epic: Other`, add `Type: Enhancement` |

### Phase 4: Update overview.md links

Update all links from `./features/{epic}/` to `./{epic}/`.

### Phase 5: Update commands

Update `/document` and `/plan` commands to reference the new epic-based directory structure instead of `docs/features/`, `docs/bugs/`, `docs/enhancements/`.

### Phase 6: Clean up

Remove empty directories:
- `docs/features/`
- `docs/bugs/`
- `docs/enhancements/`

### Key Files

| Action | File | Description |
|---|---|---|
| Modify | `docs/contributions/templates/feature.md` | Add `Type` field |
| Modify | `docs/contributions/templates/bug.md` | Replace `Area` with `Epic`, add `Type` |
| Modify | `docs/contributions/templates/enhancement.md` | Replace `Area` with `Epic`, add `Type` |
| Modify | `docs/overview.md` | Update all feature links to new paths |
| Move | `docs/features/**/*.md` (30 files) | Move to epic directories at `docs/` root |
| Move | `docs/bugs/*.md` (1 file) | Move to `docs/other/` |
| Move | `docs/enhancements/*.md` (1 file) | Move to `docs/other/` |
| Delete | `docs/features/` | Remove empty directory tree |
| Delete | `docs/bugs/` | Remove empty directory |
| Delete | `docs/enhancements/` | Remove empty directory |
| Modify | `.claude/commands/document.md` | Update directory mappings |
| Modify | `.claude/commands/plan.md` | Update directory mappings |

## Key Decisions

1. **Epic directories at docs/ root, not nested under features/** — Jira/Agile treats epics as top-level organizational units. Nesting under `features/` adds unnecessary depth and conflates "type" with "area".

2. **`other/` as catch-all** — Documents that don't map to an MVP epic (bugs, enhancements, non-epic features) go to `other/`. The `Type` field preserves what kind of document it is.

3. **`Type` field instead of directory-based categorization** — Rather than separate `bugs/` and `enhancements/` directories, each document declares its type via metadata. This keeps the structure flat by epic while retaining the ability to filter by type.

4. **`contributions/` stays unchanged** — Templates, guidelines, and setup docs serve a different purpose (contributor onboarding) and don't belong to any epic.

## Notes

- 36 total documents to process (32 moves + 4 metadata-only fixes)
- The `unlinked-profiles.md` doc has no metadata at all and needs the most work
- Three battle report docs use `Done` instead of `Completed` — normalize these
