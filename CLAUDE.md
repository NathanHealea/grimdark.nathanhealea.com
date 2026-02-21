# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Grimdark League** is a league management tool for a small, local Warhammer 40,000 tabletop gaming group (5-15 players) based in Eugene/Springfield, Oregon. It is run by a small team of 2-3 organizers who use the admin tools to manage members, roles, and league operations.

The app focuses on **league operations and competitive tracking**: managing member profiles, recording battle results, tracking standings across seasons, and surfacing stats. It is not a social platform — it's a structured tool for organizing and running a Warhammer 40k league.

### Target Users

- **Members (players)** — League members who record battle results, maintain their profile (display name, bio, faction/army), and view standings.
- **Organizers (admins)** — A small team that manages member roles, edits profiles, and oversees league operations via the admin panel.
- **Visitors** — Anyone can browse public pages (member directory, battle reports, standings) without logging in.

### Domain Concepts (Warhammer 40k)

- **Factions** — The armies players collect and play. Organized hierarchically: alliance (Imperium, Chaos, Xenos) > faction (Space Marines, Aeldari, etc.) > sub-faction/chapter (Blood Angels, Dark Angels, etc.). Players can associate multiple factions with their profile.
- **Battle Reports** — Records of individual games between two players. Captures attacker/defender, factions played, scores, outcome (win/loss/draw), mission, deployment, battle size (points), and rounds played.
- **Battle Sizes** — Games are played at standard point levels: Combat Patrol (500), Incursion (1000), Strike Force (2000), Onslaught (3000).
- **Missions & Deployments** — Predefined game scenarios and map configurations from the official rules. Stored as lookup tables.
- **Seasons** — Time-bounded league periods with defined rules and point limits. Standings and stats are tracked per season. (Planned — not yet implemented.)
- **Standings** — Win/loss/draw records and rankings derived from battle reports, filtered by season. (Planned — not yet implemented.)

### Product Direction

The current priority is finishing the MVP epics tracked in `docs/overview.md`. Beyond those, the planned direction includes:

- **Season-based structure** — Seasons with start/end dates, format rules, and point limits. Stats and standings are scoped to seasons.
- **Stats & analytics** — Player win rates, faction matchup data, historical trends across seasons.

When suggesting features or improvements, keep in mind this is a small-group tool — prefer simple, direct solutions over complex abstractions. Features should serve the core loop: members join, play games, record results, and track standings.

### What's Built

See `docs/overview.md` for the full epic tracker with acceptance criteria. See `README.md` for a quick feature status table. Key completed areas: authentication (email + Discord OAuth), profiles with avatar upload, role-based access (user/member/admin), faction system, battle report submission and feed, admin user management. Key remaining areas: season system, leaderboard/standings, league landing page.

## Commands

- `npm run dev` — Start dev server with Node inspector (`--inspect`)
- `npm run build` — Production build
- `npm run start` — Production server
- `npm run lint` — ESLint
- `npm run prettify` — Prettier (formats entire codebase)
- `npm run db:seed` — Seed database via ts-node
- `npm run db:types` — Generate TypeScript types from Supabase schema

## Architecture

- **Next.js 16 App Router** with server components as default. All routes live under `src/app/`.
- **Supabase** for database (PostgreSQL), auth, and real-time. SSR integration via `@supabase/ssr`. Local dev instance at `127.0.0.1:54321`.
- **Styling**: Tailwind CSS v4 + DaisyUI v5 component library. Dark mode via `prefers-color-scheme`.
- **Fonts**: Geist Sans and Geist Mono loaded via `next/font`, exposed as CSS variables `--font-geist-sans` and `--font-geist-mono`.
- **Icons**: `@heroicons/react` v2.

## Path Aliases (tsconfig)

- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/lib/*` → `./src/lib/*`
- `@/styles/*` → `./src/styles/*`
- `@/layouts/*` → `./src/layouts/*`
- `@/models/*` → `./src/models/*`
- `@types/*` → `./src/types/*`

## UI Patterns

- **Dropdowns**: Use Headless UI `Menu` (`@headlessui/react`) for all dropdown menus instead of DaisyUI's native `dropdown` class. The Headless UI Menu auto-closes on item click, provides proper focus management, and keyboard navigation. See `src/components/user-menu.tsx`, `src/components/admin-menu.tsx`, and `src/components/actions-menu.tsx` for reference implementations.

## Code Style

- **No semicolons**, single quotes, 120 char line width, trailing commas (ES5)
- Prettier auto-sorts Tailwind classes and organizes imports
- ESLint extends `next/core-web-vitals` and `next/typescript`
- ES module project (`"type": "module"` in package.json)
