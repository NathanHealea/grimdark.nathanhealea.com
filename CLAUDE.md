# Grimdark League

League management tool for a small, local Warhammer 40,000 tabletop gaming group (5-15 players) in Eugene/Springfield, Oregon, run by a team of 2-3 organizers. It focuses on league operations and competitive tracking — managing member profiles, recording battle results, tracking standings across seasons, and surfacing stats. Not a social platform, a structured tool for running a Warhammer 40k league.

**Core loop:** members join → play games → record results → track standings.

## Docs

Planning and feature documentation lives in `docs/`, organized into numbered epic directories (e.g. `01-authentication-and-user-accounts/`, `06-factions/`). `docs/overview.md` is the epic tracker with acceptance criteria; `README.md` has a quick feature status table.

Key completed areas: authentication (email + Discord OAuth), profiles with avatar upload, role-based access (user/member/admin), faction system, battle report submission and feed, admin user management, seasons, leaderboard/standings. Remaining: league landing page, stats & analytics.

## Target Users

- **Members (players)** — Record battle results, maintain their profile (display name, bio, faction/army), and view standings.
- **Organizers (admins)** — Manage member roles, edit profiles, and oversee league operations via the admin panel.
- **Visitors** — Browse public pages (member directory, battle reports, standings) without logging in.

## Domain Concepts (Warhammer 40k)

- **Factions** — The armies players collect and play. Hierarchical: alliance (Imperium, Chaos, Xenos) > faction (Space Marines, Aeldari, etc.) > sub-faction/chapter (Blood Angels, Dark Angels, etc.). Players can associate multiple factions with their profile.
- **Battle Reports** — Records of games between two players. Capture attacker/defender, factions played, scores, outcome (win/loss/draw), mission, deployment, battle size (points), and rounds played.
- **Battle Sizes** — Standard point levels: Combat Patrol (500), Incursion (1000), Strike Force (2000), Onslaught (3000).
- **Missions & Deployments** — Predefined scenarios and map configurations from the official rules. Stored as lookup tables.
- **Seasons** — Time-bounded league periods with defined rules and point limits. Standings and stats are tracked per season.
- **Standings** — Win/loss/draw records and rankings derived from battle reports, filtered by season.

Keep in mind this is a small-group tool — prefer simple, direct solutions over complex abstractions. Features should serve the core loop.

## Conventions

- **Commit format:** `type(scope): description` (conventional commits). Common types: `feature`, `fix`, `refactor`, `chore`, `docs`. Never include `Co-Authored-By` or any Claude/AI attribution trailer.
- Feature docs follow the `/plan` → `/implement` → `/stage` → `/release` workflow (see [Workflow](#workflow)).

### Feature doc metadata

Feature docs created by `/plan` include these metadata fields at the top:

```markdown
# Feature Title

**Epic:** Factions
**Type:** Feature
**Status:** Todo
```

- **Epic** — The epic directory the doc belongs to (e.g. `Factions` → `docs/06-factions/`).
- **Type** — `feature`, `bug`, `fix`, `patch`, `refactor`, `enhancement`, or `hotfix`. Drives the branch prefix and version bump.
- **Status** — `Todo`, `In Progress`, or `Completed`. Kept in sync by `/update-docs` and the release workflow.

## Project Structure — Domain Module Approach

Feature code uses a **Domain Module** architecture under `src/modules/<module>/`. Each module owns a single domain (e.g. `battle-report`, `faction`, `season`, `leaderboard`, `profile`, `guides`, `edition`) and encapsulates its data access, components, and rules. Route pages in `src/app/` stay thin — they compose layout and fetch data, delegating logic to modules.

```
src/modules/<module>/
├── components/     # React components owned by this module
├── queries.ts      # Data access and domain logic (Supabase queries, business rules)
├── utils.ts        # Module-internal helpers
└── validation.ts   # Validation logic
```

- Not every module needs every file — scaffold only the directories/files a module actually uses.
- Do not create barrel/index re-export files — import directly from the specific file.
- Cross-module imports are allowed, but a module should not reach into another module's internals when a query or helper already exists for the same purpose.
- Route pages (`src/app/**/page.tsx`) handle layout and data fetching only.

## React & TypeScript Best Practices

- **No `React.` namespace** — import types directly: `import type { ReactNode } from 'react'`.
- **No `import * as React`** — use named imports: `import { useState, useEffect } from 'react'`.
- **`useActionState`** — import from `'react'` (React 19), not `'react-dom'`.
- **Use `type` imports** for types.
- Server components are the default; add `'use client'` only where interactivity requires it.

## Styling

- **Tailwind CSS v4 + shadcn/ui** (Radix primitives + `class-variance-authority`). Global styles and theme tokens in `src/styles/globals.css` (imported into the root layout with a relative path — a side-effect CSS import via the `@/styles` alias trips TS2882); per-component stylesheets live in `src/styles/components/`. The `cn()` class-merge helper lives in `src/lib/utils.ts`.
- Dark-only "grimdark" theme via `color-scheme: dark`. Gold brand `#c9a84c`, near-black bases, Georgia serif body.
- **Fonts**: Geist Sans and Geist Mono via `next/font`, exposed as CSS variables `--font-geist-sans` and `--font-geist-mono`.
- **Icons**: `@heroicons/react` v2 (kept — not migrated to lucide).
- Prettier auto-sorts Tailwind classes.

### UI Refactor Standards (DaisyUI → shadcn/ui)

The UI layer is being migrated from DaisyUI to shadcn/ui under the `ui-refactor` epic (`docs/10-ui-refactor/`). These standards are standing rules for all UI work:

1. **Build via shadcn where possible** — add primitives with the shadcn CLI into `src/components/ui/`; wrap Radix behavior rather than hand-rolling.
2. **Keep DaisyUI-style semantic class names** — `btn`, `card`, `badge`, `data-table`, etc. remain the public API in JSX; they are reimplemented on top of shadcn tokens underneath.
3. **One CSS file per component** under `src/styles/components/` (e.g. `button.css`, `card.css`, `form.css`). Imported into `globals.css` via `@import '../styles/components/<name>.css' layer(components);`.
4. **Style with `@apply` on theme CSS variables** in those per-component files — not inline Tailwind utility soup in JSX. Layout one-offs (flex/grid/spacing on a specific page) may stay inline in JSX.
5. **Use the shadcn tokens** (`--primary`, `--background`, `--foreground`, `--muted`, `--border`, `--radius`, …) — never reintroduce DaisyUI token names (`base-100`, `base-content`, `rounded-box`, etc.).
6. **Preserve current visual styling** except admin pages, which are being redesigned as a dashboard (see doc 07, modeled on `../grimify`).
7. **Migrate incrementally** — shared primitives first, then domain components.

**Kept as-is (not migrated):** Headless UI `Menu` for dropdowns (restyled only), native `<select>` / `<input type="checkbox">` styled via CSS, `@heroicons/react` icons.

**Token / theme reference:** tokens are OKLch equivalents of the original grimdark palette, defined in `:root` and mapped to Tailwind theme colors via `@theme inline` in `globals.css`.

| DaisyUI token | shadcn token | JSX class example |
| ------------- | ------------ | ----------------- |
| `base-100` | `--background` | `bg-background` |
| `base-200` | `--card` / `--popover` | `bg-card` |
| `base-300` | `--muted` / `--secondary` / `--accent` / `--border` / `--input` | `bg-muted`, `border-border` |
| `base-content` | `--foreground` / `--card-foreground` | `text-foreground` |
| `base-content/70`, `neutral-content` | `--muted-foreground` | `text-muted-foreground` |
| `primary` (gold) | `--primary` / `--primary-foreground` | `bg-primary text-primary-foreground` |
| `error` | `--destructive` / `--destructive-foreground` | `text-destructive` |
| `success` / `warning` / `info` | `--success` / `--warning` / `--info` | `text-success` |
| `rounded-box` / `rounded-field` | `--radius` scale (`rounded-lg`/`-md`/`-sm`/`-xl`) | `rounded-xl` |

### UI Patterns

- **Dropdowns**: Use Headless UI `Menu` (`@headlessui/react`) for all dropdown menus — it auto-closes on item click and provides proper focus management and keyboard navigation. See `src/components/user-menu.tsx`, `src/components/admin-menu.tsx`, and `src/components/actions-menu.tsx`.

## Testing

- **Framework**: none — no test files or test runner configured.

## Commands

- `npm run dev` — Start dev server on port 54400
- `npm run build` — Production build
- `npm run start` — Production server
- `npm run lint` — ESLint
- `npm run prettify` — Prettier (formats entire codebase)
- `npm run db:types` — Generate TypeScript types from the linked Supabase schema
- `npm run db:start` / `db:stop` / `db:restart` — Manage the local Supabase instance
- `npm run db:reset` — Reset the local database
- `npm run db:pull` / `db:update` — Pull from / push to the linked Supabase schema

## Architecture

- **Next.js 16 App Router** with server components as default. Routes live under `src/app/`.
- **Supabase** for database (PostgreSQL), auth, and real-time. SSR integration via `@supabase/ssr`. Local dev instance at `127.0.0.1:54321`.

## Path Aliases (tsconfig)

- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/lib/*` → `./src/lib/*`
- `@/styles/*` → `./src/styles/*`
- `@/layouts/*` → `./src/layouts/*`
- `@/models/*` → `./src/models/*`
- `@types/*` → `./src/types/*`

## Code Style

- **No semicolons**, single quotes, 120 char line width, trailing commas (ES5)
- Prettier auto-sorts Tailwind classes and organizes imports
- ESLint extends `next/core-web-vitals` and `next/typescript`

## Workflow

- **Docs directory**: `docs/` (numbered epic directories + `overview.md` tracker)
- **Remote type**: `github`
- **Default merge target**: `main`
- **Branching**: `feature/*`, `fix/*`, `refactor/*`, `breaking/*` — always branch from and merge back to `main`.

Slash commands defined at the user level (`~/.claude/commands/`) form the lifecycle:

1. **`/plan <type> <description>`** — Create a doc with an implementation plan in the appropriate epic directory.
2. **`/implement <doc.md>`** — Set up an isolated worktree and execute the plan step by step.
3. **`/stage`** — Run build + lint, bump version, commit, push, and open a PR.
4. **`/release`** — Squash-merge the PR, delete the branch, remove the worktree, and update local `main`.

Utilities: `/list` (non-completed docs by status), `/update-docs` (sync doc criteria + status to the codebase).

**Version bump rules** (based on branch prefix):

| Branch prefix | Bump type | Example        |
| ------------- | --------- | -------------- |
| `feature/*`   | minor     | 2.4.0 → 2.5.0 |
| `fix/*`       | patch     | 2.4.0 → 2.4.1 |
| `refactor/*`  | patch     | 2.4.0 → 2.4.1 |
| `breaking/*`  | major     | 2.4.0 → 3.0.0 |
| anything else | patch     | 2.4.0 → 2.4.1 |
