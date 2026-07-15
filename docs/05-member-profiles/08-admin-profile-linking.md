# Admin Profile Linking & Merge

**Epic:** Member Profiles
**Type:** Feature
**Status:** Completed

## Summary

Allow administrators to manually link unlinked profiles to existing user accounts and merge duplicate profiles. This solves three real-world scenarios: (1) a user signs up and creates a new profile while an admin-created profile with stats already exists, (2) a profile's link ID was wrong so auto-linking failed and a duplicate was created, and (3) any situation where two profiles need to be combined into one.

## Acceptance Criteria

- [x] Admins can manually link an unlinked profile to an auth user by searching for the user's email
- [x] When linking, if the auth user already has a profile, the admin is warned and offered a merge option
- [x] Admins can merge two profiles: all battle reports, factions, and optional profile data transfer from source to target
- [x] After merge, the source profile is deleted and all its battle report references (attacker, defender, reported_by) point to the target
- [x] The merge operation is atomic — either everything transfers or nothing does
- [x] The merge preview shows what will be transferred (battle report count, faction count)
- [x] Non-admin users cannot access link or merge functionality
- [x] Build and lint pass

## Problem Scenarios

### Scenario 1: User signs up, admin already created a profile with stats

1. Admin creates unlinked profile "WarhammerFan" with battle reports and standings
2. User signs up with email/password
3. Middleware redirects to `/profile/setup` → user creates a new linked profile "WarhammerFan2"
4. Now two profiles exist: "WarhammerFan" (unlinked, has stats) and "WarhammerFan2" (linked, empty)

**Resolution:** Admin merges "WarhammerFan" into "WarhammerFan2" — all battle reports transfer to the linked profile, unlinked profile is deleted.

### Scenario 2: Wrong link ID, auto-linking fails

1. Admin creates unlinked profile "BattleBrother" with `link_id = "wrong_discord_id"`
2. User signs in via Discord → `link_id` doesn't match → auto-linking skipped
3. Middleware redirects to `/profile/setup` → user creates new linked profile
4. Two profiles exist again

**Resolution:** Same as Scenario 1 — admin merges the unlinked profile (with stats) into the linked one.

### Scenario 3: General duplicate cleanup

Any situation where two profiles represent the same person and need to be combined.

**Resolution:** Admin uses the merge tool to combine them.

## Routes

No new routes. All functionality is added to the existing admin edit profile page.

| Route | Description |
|---|---|
| `/admin/user-management/[profileId]/edit` | Enhanced with Link and Merge sections |

## Database

### Migration: `supabase/migrations/XXXXXX_add_merge_profiles_function.sql`

#### `merge_profiles(source_uuid UUID, target_uuid UUID)` function

Atomically transfers all data from source profile to target profile, then deletes source.

```sql
CREATE OR REPLACE FUNCTION public.merge_profiles(source_uuid UUID, target_uuid UUID)
RETURNS jsonb AS $$
DECLARE
  battle_reports_moved integer := 0;
  factions_moved integer := 0;
  source_profile profiles%ROWTYPE;
  target_profile profiles%ROWTYPE;
BEGIN
  -- Validate both profiles exist
  SELECT * INTO source_profile FROM profiles WHERE id = source_uuid;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source profile not found'; END IF;

  SELECT * INTO target_profile FROM profiles WHERE id = target_uuid;
  IF NOT FOUND THEN RAISE EXCEPTION 'Target profile not found'; END IF;

  -- Cannot merge a profile into itself
  IF source_uuid = target_uuid THEN RAISE EXCEPTION 'Cannot merge a profile into itself'; END IF;

  -- Transfer battle reports: attacker_id
  UPDATE battle_reports SET attacker_id = target_uuid WHERE attacker_id = source_uuid;
  GET DIAGNOSTICS battle_reports_moved = ROW_COUNT;

  -- Transfer battle reports: defender_id
  UPDATE battle_reports SET defender_id = target_uuid WHERE defender_id = source_uuid;
  battle_reports_moved := battle_reports_moved + ROW_COUNT;  -- Note: this double-counts if same report has source as both

  -- Transfer battle reports: reported_by
  UPDATE battle_reports SET reported_by = target_uuid WHERE reported_by = source_uuid;

  -- Transfer profile_factions (skip conflicts — target may already have the same faction)
  INSERT INTO profile_factions (profile_id, faction_id)
    SELECT target_uuid, faction_id FROM profile_factions WHERE profile_id = source_uuid
    ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS factions_moved = ROW_COUNT;

  -- Optionally copy bio/avatar if target's are null
  UPDATE profiles SET
    bio = COALESCE(target_profile.bio, source_profile.bio),
    avatar_url = COALESCE(target_profile.avatar_url, source_profile.avatar_url),
    link_id = COALESCE(target_profile.link_id, source_profile.link_id)
  WHERE id = target_uuid;

  -- Delete source profile (cascade removes source's profile_factions and user_roles if any)
  DELETE FROM profiles WHERE id = source_uuid;

  RETURN jsonb_build_object(
    'battle_reports_moved', battle_reports_moved,
    'factions_moved', factions_moved
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `merge_preview(source_uuid UUID, target_uuid UUID)` function

Returns a preview of what will be transferred, so the admin can confirm before merging.

```sql
CREATE OR REPLACE FUNCTION public.merge_preview(source_uuid UUID, target_uuid UUID)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'battle_reports_as_attacker', (SELECT count(*) FROM battle_reports WHERE attacker_id = source_uuid),
    'battle_reports_as_defender', (SELECT count(*) FROM battle_reports WHERE defender_id = source_uuid),
    'battle_reports_as_reporter', (SELECT count(*) FROM battle_reports WHERE reported_by = source_uuid),
    'factions', (SELECT count(*) FROM profile_factions WHERE profile_id = source_uuid),
    'source_display_name', (SELECT display_name FROM profiles WHERE id = source_uuid),
    'target_display_name', (SELECT display_name FROM profiles WHERE id = target_uuid)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### RLS Policies

No new RLS policies needed. Both functions use `SECURITY DEFINER` and are called from server actions that check admin role. The existing `link_profile` and `unlink_profile` RPCs follow the same pattern.

## Implementation

### Key Files

| Action | File | Description |
|---|---|---|
| Create | `supabase/migrations/XXXXXX_add_merge_profiles_function.sql` | Add `merge_profiles` and `merge_preview` functions |
| Modify | `src/app/admin/user-management/[profileId]/edit/actions.ts` | Add `linkProfileAction` and `mergeProfileAction` server actions |
| Modify | `src/app/admin/user-management/[profileId]/edit/admin-edit-profile-form.tsx` | Add Link and Merge UI sections |
| Modify | `src/app/admin/user-management/[profileId]/edit/page.tsx` | Fetch additional data (unlinked auth users, other profiles) |

### Approach

#### 1. Database migration — Merge functions

Create `merge_profiles` and `merge_preview` SQL functions as described above. Key considerations:

- `merge_profiles` must handle the `attacker_defender_different` CHECK constraint on `battle_reports` — if the source was the attacker and target was the defender (or vice versa) in the same battle, the merge would cause both to reference the same profile. This should be caught and reported as a conflict rather than silently failing.
- `SECURITY DEFINER` ensures the function runs with elevated permissions regardless of who calls it.
- The function returns stats about what was transferred for UI feedback.

#### 2. Server actions — Link and Merge

Add two new server actions to `src/app/admin/user-management/[profileId]/edit/actions.ts`:

**`linkProfileAction(prevState, formData)`:**
1. Validate admin role
2. Get `profile_id` (the unlinked profile) and `auth_user_id` (the selected user) from form data
3. Check if the auth user already has a linked profile — if so, return error suggesting merge
4. Call existing `link_profile` RPC
5. Return success/error

**`mergeProfileAction(prevState, formData)`:**
1. Validate admin role
2. Get `source_profile_id` and `target_profile_id` from form data
3. Call `merge_profiles` RPC
4. Return success with stats (battle reports moved, etc.)

**`getMergePreviewAction(sourceId, targetId)`:**
1. Validate admin role
2. Call `merge_preview` RPC
3. Return preview data

#### 3. Page data — Fetch linkable users and mergeable profiles

Update `src/app/admin/user-management/[profileId]/edit/page.tsx` to fetch:

- **For linking:** Auth users who don't have a linked profile (for the user picker). Query `auth.users` via Supabase admin API or query profiles to find `user_id IS NULL` gaps.
- **For merging:** All other profiles (to select merge source). A simple list of `{ id, display_name, profile_id }` from profiles, excluding the current one.

Pass these as props to the form component.

#### 4. UI — Link to User section

On the admin edit page for **unlinked profiles**, add a "Link to User" section:

- A search/select input to find an auth user by email
- A "Link" button that calls `linkProfileAction`
- If the selected user already has a profile, show a warning: "This user already has a profile (DisplayName). You may need to merge profiles first."

Implementation note: Querying auth users by email requires `supabase.auth.admin.listUsers()` which needs the service role key. Use this in the page server component, not in the client component.

#### 5. UI — Merge Profiles section

Add a "Merge" section to the admin edit page:

- A profile selector (dropdown or search) to choose the source profile to merge into this one
- A "Preview Merge" button that calls `getMergePreviewAction` and shows what will be transferred
- A "Confirm Merge" button (with confirmation dialog) that calls `mergeProfileAction`
- Show results: "Transferred X battle reports and Y factions. Source profile deleted."

The merge section should be available on ALL profiles (both linked and unlinked), since merging can go in either direction.

#### 6. Battle report conflict handling

The `battle_reports` table has a constraint: `attacker_id != defender_id`. If the source and target profiles appeared on opposite sides of the same battle, merging would violate this constraint.

**Handling approach:** The `merge_profiles` function should check for conflicts before merging:

```sql
-- Check for battles where source and target are on opposite sides
IF EXISTS (
  SELECT 1 FROM battle_reports
  WHERE (attacker_id = source_uuid AND defender_id = target_uuid)
     OR (attacker_id = target_uuid AND defender_id = source_uuid)
) THEN
  RAISE EXCEPTION 'Cannot merge: profiles appear on opposite sides of the same battle report(s)';
END IF;
```

This should be surfaced in the merge preview as well, so the admin knows before attempting.

### Implementation Steps

1. **Database migration** — Create `merge_profiles` and `merge_preview` functions
2. **Server actions** — Add `linkProfileAction`, `mergeProfileAction`, `getMergePreviewAction`
3. **Page data** — Fetch auth users and profiles for pickers
4. **Link UI** — Add "Link to User" section for unlinked profiles
5. **Merge UI** — Add merge section with preview and confirmation
6. **Conflict detection** — Handle attacker/defender same-battle edge case
7. **Testing** — Test all three scenarios end-to-end
8. **Build and lint** — Ensure no errors

## Key Design Decisions

1. **Two separate operations (link + merge) rather than one combined action** — Linking and merging are distinct operations with different concerns. An admin may want to merge without linking (e.g., combining two unlinked profiles). Keeping them separate makes each simpler and more composable.

2. **Merge direction: source INTO target** — The source profile is absorbed into the target. The target keeps its identity (id, display_name, profile_id, user_id). This makes it natural: "merge this old/duplicate profile into the canonical one."

3. **SECURITY DEFINER for merge function** — Like the existing `link_profile` and `unlink_profile` RPCs, the merge function uses `SECURITY DEFINER` to bypass RLS. Permission checks happen in the server action layer (`hasRole(user.id, 'admin')`).

4. **Fail on battle report conflict rather than silently resolving** — If two profiles were on opposite sides of the same battle, merging would violate the `attacker_id != defender_id` constraint. Rather than silently deleting the battle report or making a judgment call, we surface the conflict and let the admin resolve it manually (e.g., delete or reassign the conflicting report first).

5. **Preserve target profile data, fill gaps from source** — Bio, avatar, and link_id from the source only carry over if the target's values are null. This ensures the target (canonical) profile's data takes precedence.

## Notes

- The existing `link_profile` RPC already handles the core linking logic. The new `linkProfileAction` server action wraps it with admin auth checks and conflict detection.
- The `unlink_profile` RPC already exists and works — no changes needed for unlinking.
- After merging, if the surviving profile is unlinked, the admin can then use "Link to User" to connect it to an auth account.
- The merge preview is important for safety — admins should see exactly what will transfer before confirming an irreversible operation.
- Profile `profile_id` (the auto-increment sequence number used in URLs like `/profile/42`) belongs to the target and is preserved. The source's `profile_id` is lost after deletion.
