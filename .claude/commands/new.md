# New Work Item

Start a new work item by creating a git worktree with its own branch and a context file. This is the second step in the workflow — after `/plan` has created a documentation file.

## Input

**`$ARGUMENTS`:** $ARGUMENTS

The primary input is a **path to a documentation file** created by `/plan`:

```
/new <path/to/doc.md>
```

Alternatively, pass a **type + description** for quick work that doesn't need a plan doc:

```
/new <type> <description of work>
```

If no arguments are provided, ask the user what they want to work on.

## Steps

### 1. Parse input

Check if `$ARGUMENTS` is a **path to a `.md` file** (ends with `.md` and the file exists). If so, follow **Step 1a (doc file)**. Otherwise, follow **Step 1b (type + description)**.

### 1a. Parse from doc file

Read the `.md` file and extract:

- **Type**: From the `**Type:**` field in the frontmatter (e.g., `Feature`, `Enhancement`, `Bug`). Map to a valid type using the table below.
- **Description**: From the `## Summary` section content.
- **Doc directory**: The directory the doc file lives in (e.g., if the file is `docs/member-profiles/foo.md`, the doc directory is `docs/member-profiles/`).
- **Doc path**: The full path to the doc file (for the context file).

Type mapping (doc type → branch prefix):

| Doc type (case-insensitive) | Maps to type | Branch prefix |
|---|---|---|
| `Feature` | `feature` | `feature/` |
| `Bug` | `bug` | `fix/` |
| `Enhancement` | `enhancement` | `refactor/` |

If the doc type doesn't match, ask the user which type to use.

Generate the **branch slug** from the doc filename (strip `.md`, e.g., `admin-profile-linking.md` → `admin-profile-linking`).

Skip Step 1c (doc directory is already known from the file path).

### 1b. Parse from type + description

Extract the **type** (first word) and the **description** (remaining words) from the arguments.

Valid types and their branch prefixes:

| Type | Branch prefix |
|------|--------------|
| `feature` | `feature/` |
| `bug` | `fix/` |
| `fix` | `fix/` |
| `patch` | `fix/` |
| `refactor` | `refactor/` |
| `enhancement` | `refactor/` |
| `hotfix` | `hotfix/` |

If the type is not recognized, stop and tell the user the valid types.

If no description is provided, ask the user what they want to work on.

### 1c. Determine document directory

**Skip this step if the input was a doc file (Step 1a) — the doc directory is already known.**

Analyze the **description** to determine which epic directory the documentation should live in. List the existing directories under `docs/` and pick the best semantic match for the work being described.

**Rules:**
1. Read the existing directories under `docs/` (exclude `contributions/` and `overview.md`)
2. Match the description to the most relevant epic directory based on the subject matter
3. If no existing directory is a good fit, use `docs/other/`
4. If the work clearly warrants a new epic directory, create one with a kebab-case name — but prefer existing directories when reasonable

Set the **doc directory** for use in the context file (e.g., `docs/seasons/`, `docs/standings-and-leaderboard/`, `docs/other/`).

### 2. Pre-flight check

- Confirm we are on `main` in the **main worktree**. If not on `main`, warn the user and ask if they want to continue from the current branch or switch to `main` first.
- Run `git pull` to ensure `main` is up to date.

### 3. Determine names

From the description, generate:

- **Branch name**: `{prefix}/{kebab-case-slug}` — a short, descriptive kebab-case slug (3-5 words max). Example: `feature/season-standings-filter`
- **Branch slug**: The kebab-case slug portion (without the prefix). Example: `season-standings-filter`
- **Worktree directory**: `.claude/worktrees/{branch-slug}` — relative to the main repo root.

Tell the user:
- The branch name
- The worktree path

Ask for confirmation before proceeding.

### 4. Create the worktree

Create the `.claude/worktrees/` directory if it doesn't exist, then create the worktree with a new branch:

```bash
mkdir -p .claude/worktrees
git worktree add .claude/worktrees/{branch-slug} -b {branch-name}
```

### 5. Copy configuration files

Copy all necessary config files from the **main worktree** into the new worktree so it can run as an independent instance. Use the main repo root as the source (the directory this command is being run from).

**Files to copy:**

```bash
# Environment files
cp .env .claude/worktrees/{branch-slug}/.env
cp .env.local .claude/worktrees/{branch-slug}/.env.local

# Supabase local env (if exists)
cp supabase/.env.local .claude/worktrees/{branch-slug}/supabase/.env.local

# Claude Code config (so Claude works in the worktree)
cp CLAUDE.md .claude/worktrees/{branch-slug}/CLAUDE.md
cp .mcp.json .claude/worktrees/{branch-slug}/.mcp.json 2>/dev/null || true
cp -r .claude .claude/worktrees/{branch-slug}/.claude 2>/dev/null || true
```

Only copy files that exist — skip any that are missing without error.

### 6. Create the context file

Create a file called `.context.{branch-slug}.md` in the **root of the worktree**. This file captures the initial context so other commands can reference it without the user retyping information.

Write the following content:

```markdown
# Context: {Doc Title}

- **Type**: {type}
- **Branch**: {branch-name}
- **Doc directory**: {doc directory, e.g. docs/seasons/}
- **Created**: {current date YYYY-MM-DD}

## Description

{The full description the user provided, or the Summary from the doc file}
```

If the input was a **doc file** (Step 1a), also append:

```markdown

## Documentation

- **Doc path**: {path to the doc file that was used as input}
```

This file is gitignored (covered by the `.context.*` pattern — add it to `.gitignore` if not already present).

### 7. Install dependencies

Run `npm install` inside the worktree to set up `node_modules`:

```bash
cd .claude/worktrees/{branch-slug} && npm install
```

Wait for this to complete before continuing.

### 8. Start the dev server

Start the Next.js dev server in the worktree as a **background process** so the user can begin working immediately:

```bash
cd .claude/worktrees/{branch-slug} && npm run dev
```

Run this in the background using Bash with `run_in_background: true`. The dev server will keep running while the user works.

### 9. Report

Tell the user:
- The branch name (ready to work on)
- The worktree path (full path for `cd`)
- The context file path
- That the dev server is running in the background

**Provide a ready-to-copy command** to start a new Claude Code session in the worktree and run `/implement`:

```
cd {absolute worktree path} && claude
```

Then tell them to run `/implement` once inside that session.

- If the input was **type + description**: Suggest they run `/plan` first to create the implementation plan before `/implement`
- Remind them to use `/stage` when ready to release
- Remind them the worktree can be removed later with: `git worktree remove .claude/worktrees/{branch-slug}`
