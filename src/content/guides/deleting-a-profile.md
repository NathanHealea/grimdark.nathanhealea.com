---
title: 'How to Delete a Profile'
description: 'Remove a member profile from the league'
category: 'Profile Management'
order: 22
role: 'admin'
---

# How to Delete a Profile

Deleting a profile removes it from the league. This should be used with caution.

## Before Deleting

Consider whether [merging](/guides/merging-profiles) is more appropriate. If the player has battle reports under this profile, deleting it will leave orphaned references. Merging transfers all data to another profile first.

## Steps

1. Go to **Admin > Users**
2. Click the actions menu on the profile
3. Select **Delete** (or navigate to the edit page and use the delete option)
4. Confirm the deletion

## What Happens

- The profile is permanently removed
- If the profile was linked to an auth account, the link is broken (the auth account still exists but has no profile)
- Battle reports referencing this profile will show "Unknown" for that player
- Season roster entries for this profile are removed

> This action cannot be undone. Consider setting the profile to an inactive state or merging it instead if the player has any history in the league.
