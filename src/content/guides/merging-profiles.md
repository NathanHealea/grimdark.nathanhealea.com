---
title: 'How to Merge Profiles'
description: 'Combine two profiles into one, transferring all battle reports and factions'
category: 'Profile Management'
order: 23
role: 'admin'
---

# How to Merge Profiles

Merging combines two profiles into one. This is useful when a player has duplicate profiles — for example, an unlinked profile created before they signed up, and a new profile they created during registration.

## Steps

### 1. Open the Target Profile

Go to **Admin > Users** and edit the profile you want to **keep** (the target). This is the profile that will receive all data from the other one.

### 2. Find the Merge Section

Scroll down to the **Merge Profiles** section. This section only appears if there are other profiles in the system that could be merged.

### 3. Select the Source Profile

Choose the profile to merge **from** using the dropdown. This is the profile that will be deleted after the merge.

### 4. Preview the Merge

Click **Preview** to see what will be transferred:

- **Battle reports as attacker** — Count of reports where the source is the attacker
- **Battle reports as defender** — Count of reports where the source is the defender
- **Battle reports as reporter** — Count of reports submitted by the source
- **Factions** — Number of faction associations to transfer

> If both profiles appear on opposite sides of the same battle report (one as attacker and the other as defender), a **conflict warning** will appear. You cannot merge profiles with conflicting battle report data.

### 5. Confirm the Merge

Review the preview, then confirm. The merge will:

1. Transfer all battle report references (attacker, defender, reporter) from the source to the target
2. Transfer all faction associations (skipping duplicates)
3. Permanently delete the source profile

> This action is **irreversible**. The source profile and all its direct data are permanently removed. Make sure you're merging in the right direction — the source is deleted, the target is kept.
