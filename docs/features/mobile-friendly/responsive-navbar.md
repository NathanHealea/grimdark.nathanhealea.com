# Responsive Navbar

**Epic:** Mobile-Friendly Site
**Status:** Completed

## Summary

A responsive navbar that collapses navigation links and auth controls into a full-screen mobile menu on small screens, while displaying them inline on desktop. Uses Headless UI for accessibility (focus trapping, scroll locking, Escape-to-close) and DaisyUI for layout and styling.

## Acceptance Criteria

- [x] Desktop (>= 1024px): hamburger hidden, horizontal nav links and auth visible
- [x] Mobile (< 1024px): hamburger visible, nav links and auth hidden from navbar
- [x] Mobile: tapping hamburger opens a full-screen menu with nav links and auth actions
- [x] Mobile: tapping any link or button closes the menu and navigates
- [x] Mobile: pressing Escape closes the menu
- [x] Mobile: focus is trapped within the open menu
- [x] Mobile: body scroll is locked while menu is open
- [x] UserMenu dropdown works on desktop
- [x] Sticky navbar preserved on scroll
- [x] Adding a new nav link requires only a single-point change (`navLinks` array)

## Implementation Details

- **Components:** `src/components/navbar.tsx` (server) and `src/components/mobile-nav.tsx` (client)
- **Layout:** DaisyUI `navbar-start` / `navbar-center` / `navbar-end` pattern
- **Mobile menu:** Headless UI `Dialog` / `DialogPanel` with `Bars3Icon` / `XMarkIcon` toggle
- **Close behavior:** `CloseButton as={Link}` auto-closes the dialog on navigation; Escape and outside-click also close
- **Auth in mobile menu:** Authenticated users see My Profile, Edit Profile, and Sign Out; unauthenticated users see Sign In and Sign Up
- **Desktop auth:** `navbar-end` with `hidden lg:flex` renders `UserMenu` or Sign In / Sign Up buttons
- **Shared links:** `navLinks` array defined in `navbar.tsx` and passed to `MobileNav` via props
