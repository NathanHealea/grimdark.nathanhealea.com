# Replace Inline SVGs with Heroicons and Simple Icons

**Epic:** Other
**Type:** Refactor
**Status:** In Progress

<!--
Status values:
  Todo        — Not started, no acceptance criteria completed
  In Progress — Partially implemented, some acceptance criteria completed
  Completed   — Fully implemented, all acceptance criteria completed
-->

## Summary

Replace all inline SVG elements in React components with proper icon library imports — Heroicons for UI icons and `@icons-pack/react-simple-icons` for brand logos (Google, Discord). This improves consistency, reduces inline markup, and makes icons easier to maintain.

## Motivation

The codebase has 4 inline SVGs that duplicate icons already available in Heroicons, plus 2 custom brand icon components that can be replaced with a dedicated brand icon library. Using library imports instead of raw SVG markup:

- Keeps icon usage consistent across the codebase (8 Heroicons already in use)
- Reduces copy-pasted SVG path data that's hard to identify at a glance
- Makes it easy to swap icon styles (outline/solid) without touching SVG internals
- Centralizes brand icon maintenance to a single dependency

## Acceptance Criteria

- [ ] All inline `<svg>` elements in component files are replaced with Heroicon imports
- [ ] Google and Discord brand icons use `@icons-pack/react-simple-icons` instead of custom SVG components
- [x] Custom icon component files (`google-icon.tsx`, `discord-icon.tsx`) are deleted
- [x] All icon sizes and styles match the originals visually
- [x] `npm run build` passes with no errors
- [x] `npm run lint` passes with no errors

## Approach

### Step 1: Install `@icons-pack/react-simple-icons`

```bash
npm install @icons-pack/react-simple-icons
```

### Step 2: Replace XMark inline SVGs with Heroicon

Two files use an identical inline XMark SVG (20x20 filled) for removing role badges:

**File:** `src/app/admin/user-management/user-management-table.tsx`
- Replace inline `<svg>` (line ~53-55) with `XMarkIcon` from `@heroicons/react/20/solid`
- Keep `className="w-3 h-3"` sizing

**File:** `src/app/admin/user-management/[profileId]/edit/admin-edit-profile-form.tsx`
- Replace inline `<svg>` (line ~68-70) with `XMarkIcon` from `@heroicons/react/20/solid`
- Keep `className="w-3 h-3"` sizing

### Step 3: Replace list inline SVGs with Heroicons

**File:** `src/modules/markdown/components/markdown-editor.tsx`
- Replace bullet list inline SVG (line ~68-81) with `ListBulletIcon` from `@heroicons/react/24/outline`
- Replace numbered list inline SVG (line ~89-102) with `NumberedListIcon` from `@heroicons/react/24/outline`
- Keep `className="size-6"` sizing

### Step 4: Replace brand icon components with Simple Icons

**File:** `src/app/(auth)/sign-in/page.tsx`
- Replace `import GoogleIcon from '@/components/icons/google-icon'` with `import { SiGoogle } from '@icons-pack/react-simple-icons'`
- Replace `import DiscordIcon from '@/components/icons/discord-icon'` with `import { SiDiscord } from '@icons-pack/react-simple-icons'`
- Replace `<GoogleIcon className="h-5 w-5" />` with `<SiGoogle className="h-5 w-5" color="currentColor" />`
- Replace `<DiscordIcon className="h-5 w-5" />` with `<SiDiscord className="h-5 w-5" color="currentColor" />`

**File:** `src/app/(auth)/sign-up/page.tsx`
- Same replacements as sign-in page

### Step 5: Delete custom icon components

- Delete `src/components/icons/google-icon.tsx`
- Delete `src/components/icons/discord-icon.tsx`
- Remove `src/components/icons/` directory if empty

### Step 6: Verify

- Run `npm run build` — ensure no import errors or missing references
- Run `npm run lint` — ensure no lint issues
- Visual check: icons render at correct sizes and colors

### Key Files

| Action | File | Description |
|---|---|---|
| Modify | `src/app/admin/user-management/user-management-table.tsx` | Replace XMark inline SVG with Heroicon |
| Modify | `src/app/admin/user-management/[profileId]/edit/admin-edit-profile-form.tsx` | Replace XMark inline SVG with Heroicon |
| Modify | `src/modules/markdown/components/markdown-editor.tsx` | Replace list inline SVGs with Heroicons |
| Modify | `src/app/(auth)/sign-in/page.tsx` | Replace brand icon imports with Simple Icons |
| Modify | `src/app/(auth)/sign-up/page.tsx` | Replace brand icon imports with Simple Icons |
| Delete | `src/components/icons/google-icon.tsx` | Remove custom Google SVG component |
| Delete | `src/components/icons/discord-icon.tsx` | Remove custom Discord SVG component |

## Key Decisions

1. **`@icons-pack/react-simple-icons` for brand icons** — Provides React components with the same API pattern (className, size props) as Heroicons. Preferred over `react-icons` which bundles many icon sets we don't need. Preferred over raw `simple-icons` which provides SVG strings, not React components.

2. **Use `color="currentColor"` on Simple Icons** — Simple Icons default to the brand's official color. Setting `color="currentColor"` makes them inherit text color like Heroicons do, matching the existing behavior of the custom components.

3. **Use `@heroicons/react/20/solid` for XMark** — The inline SVGs use a 20x20 viewBox with `fill="currentColor"`, which maps to the 20/solid variant. The 24/outline `XMarkIcon` already used in `mobile-nav.tsx` is a different style.

## Notes

- The `src/components/icons/` directory may be fully removed if no other files exist there after deletion.
- Simple Icons updates frequently with new brand icons — future OAuth providers can use the same library.