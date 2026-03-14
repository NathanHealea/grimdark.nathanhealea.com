---
title: 'How to Manage Auth Roles'
description: 'Add and remove authentication roles from user accounts'
category: 'Profile Management'
order: 25
role: 'admin'
---

# How to Manage Auth Roles

Auth roles control what a user can access in the application. Only admins can manage roles.

## Role Types

- **User** — The default role assigned to every authenticated account. Cannot be removed.
- **Organizer** — Can access the admin panel to manage seasons, battle reports, and rosters.
- **Admin** — Full access including user management and role assignment. Can do everything an organizer can, plus manage profiles, assign roles, and link/merge accounts.

## Adding a Role

### From the User Management List

1. Go to **Admin > Users**
2. Find the user in the table
3. In the **Auth Roles** column, click the **+** button
4. Select the role to add from the dropdown

### From the Edit Profile Page

1. Go to **Admin > Users** and edit the user's profile
2. Scroll to the **Auth Roles** section (only visible for linked profiles)
3. Click the **+** button and select the role to add

The role takes effect immediately.

## Removing a Role

1. In the **Auth Roles** column (list view) or **Auth Roles** section (edit page), find the role badge you want to remove
2. Click the **X** on the role badge

The role is removed immediately.

## Restrictions

- The **User** role is protected and cannot be removed — it's shown as a gray badge
- You **cannot modify your own roles** — your role badges will appear without remove buttons, and the add dropdown will not be available
- Only profiles linked to an auth account have auth roles. Unlinked profiles do not have auth roles.

## Auth Roles vs League Roles

The system has two separate role concepts:

- **Auth Roles** (user, organizer, admin) — Control application access and permissions. Stored in the `user_roles` table and tied to the auth account.
- **League Role** (member, organizer) — A profile-level designation shown in the member directory. Set in the profile's admin settings.

These are independent. A player could have the **admin** auth role but a **member** league role, or vice versa.
