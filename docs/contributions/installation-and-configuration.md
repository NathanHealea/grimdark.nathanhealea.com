# Installation & Configuration

Guide for setting up the Grimdark League project for local development.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local Supabase)
- npm (included with Node.js)

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd grimdark.nathanhealea.com
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Start Local Supabase

Make sure Docker Desktop is running, then:

```bash
npm run db:start
```

This spins up a full local Supabase stack (Postgres, Auth, Studio, etc.) and automatically applies all migrations from `supabase/migrations/`.

Once started, note the **Project URL** and **Publishable key** from the output, or run:

```bash
npx supabase status
```

| Service | URL |
|---|---|
| API | `http://127.0.0.1:54321` |
| Studio (Dashboard) | `http://127.0.0.1:54323` |
| Mailpit (Email Inbox) | `http://127.0.0.1:54324` |
| Database | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |

## 4. Configure Environment Variables

Create a `.env.local` file in the project root with the local Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<publishable key from supabase status>
```

`.env.local` overrides `.env` and is git-ignored, so your cloud credentials stay untouched.

## 5. Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Local Email Confirmation

When signing up locally, Supabase does not send real emails. Use **Mailpit** at [http://127.0.0.1:54324](http://127.0.0.1:54324) to view confirmation emails and click the verification link.

---

## Useful Commands

| Command | Description |
|---|---|
| `npx supabase status` | Show local Supabase URLs and keys |
| `npx supabase stop` | Stop local Supabase services |
| `npx supabase db reset` | Drop and re-run all migrations from scratch |
| `npm run db:types` | Regenerate TypeScript types from the database schema |
| `npm run prettify` | Format all files with Prettier |
| `npm run lint` | Run ESLint |

---

## Switching Between Local and Cloud

- **Local**: Create `.env.local` with local Supabase credentials (as above)
- **Cloud**: Delete or rename `.env.local` — the app falls back to `.env` which points to the cloud project

Restart the dev server after switching.
