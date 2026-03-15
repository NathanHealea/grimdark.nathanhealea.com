---
title: 'How to Link a Profile'
description: 'Connect an unlinked profile to an authenticated user account'
category: 'Profile Management'
order: 24
role: 'admin'
---

# How to Link a Profile

Linking connects an unlinked profile to an authenticated user account. Once linked, the player can sign in and manage their own profile, join seasons, and submit battle reports.

## When to Link

- A profile was created by an admin before the player signed up
- A profile was unlinked from a previous account and needs to be reassigned

## Method 1: Automatic Linking via Link ID (Recommended)

Set up automatic linking **before** the player registers:

1. Go to **Admin > Users** and edit the unlinked profile
2. In the **Admin Settings** section, enter the player's **Link ID** (their Discord user ID)
3. Save the profile

When the player signs up using Discord OAuth, the system will automatically detect the matching Link ID and link their new account to the existing profile. They skip the profile setup step and inherit all their existing data.

> This is the smoothest experience for the player — they sign in and everything is already set up.

## Method 2: Manual Linking (After Registration)

If the player has already registered and created a new account (but you want them to use an existing profile instead):

1. Go to **Admin > Users** and edit the **unlinked** profile you want to keep
2. Scroll to the **Link to User** section
3. Search for the player's auth account by email or display name
4. Select the account from the dropdown — only accounts without an existing linked profile will appear
5. Click **Link**

The profile is now linked to that user account. If the player had created a separate profile during signup, you may want to [merge](/guides/merging-profiles) it into this one first to preserve any data.

## Unlinking a Profile

To unlink a profile from its user account:

1. Edit the profile in **Admin > Users**
2. In the **Link Status** section, click **Unlink**

The profile remains in the system as unlinked. The auth account still exists but will no longer have a profile associated with it.

> You cannot unlink your own profile.
