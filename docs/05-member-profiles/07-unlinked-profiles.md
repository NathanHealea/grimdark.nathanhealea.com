# Unlinked Profiles

**Epic:** Member Profiles
**Type:** Feature
**Status:** Completed

## Summary

Decouples profiles from auth so profiles can exist independently. Enables admins to create profiles for players who haven't signed up, and provides auto-linking when those players later authenticate via Discord.

## Key Changes

- `profiles.id` is now a standalone UUID (no longer FK to auth.users)
- `profiles.user_id` (nullable) links to auth.users when authenticated
- `profiles.link_id` stores platform identifiers (e.g., Discord user ID) for auto-linking
- `profiles.role` tracks league role (`member` or `organizer`) — replaces the `member` auth role
- `user_roles` FK now points directly to `auth.users` instead of `profiles`

## Profile States

| State | user_id | link_id | Description |
|-------|---------|---------|-------------|
| Linked | set | optional | Normal authenticated user with profile |
| Unlinked | NULL | optional | Admin-created profile, no auth account |
| Linkable | NULL | set | Unlinked profile that will auto-link on matching OAuth signup |

## Linking Flow

1. Admin creates unlinked profile with `link_id` (Discord user ID)
2. Player signs up via Discord OAuth
3. Auth callback checks for matching `link_id`
4. If found, calls `link_profile()` to associate the auth account
5. Player lands on home page with their existing profile (skips setup)

## Admin Actions

- Create unlinked profile (with optional link_id)
- Edit link_id on any profile
- Unlink a profile (removes auth association)
