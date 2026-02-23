# Profile Merge (Resolve Duplicates)

**Epic:** Member Profiles
**Status:** Todo

## Summary

When an admin creates an unlinked profile for a player (with battle reports attached), and that player later creates their own account (getting a second profile via profile setup), two profiles exist for the same person. This feature provides an admin tool to merge the duplicate profiles — transferring all battle reports and season participation from the source profile to the target profile, then deleting the source.

## Acceptance Criteria

- [ ] Admins can initiate a profile merge from the admin edit page
- [ ] The merge UI shows a "source" profile (the one being absorbed) and a "target" profile (the one that survives)
- [ ] Admins can select any other profile as the merge target
- [ ] Merging transfers all battle report references from source to target:
  - [ ] `battle_reports.attacker_id` updated where it matches source
  - [ ] `battle_reports.defender_id` updated where it matches source
  - [ ] `battle_reports.reported_by` updated where it matches source
- [ ] Merging transfers all season participation from source to target (once season_participants exists)
- [ ] Merging transfers faction associations from source to target (skipping duplicates)
- [ ] The source profile is deleted after all references are transferred
- [ ] A confirmation step shows what will be transferred before executing the merge
- [ ] The admin is redirected to the target profile's edit page after a successful merge
- [ ] Non-admin users cannot invoke the merge action (server-side role check)
- [ ] If the source profile is linked to an auth account, the merge unlinks it first
- [ ] Validation prevents merging a profile into itself

## Routes

| Route | Description |
|---|---|
| `/admin/user-management/[profileId]/edit` | Modified — adds merge UI in Admin Actions section |

## Database

### Migration: `supabase/migrations/XXXXXX_merge_profiles.sql`

Create a `merge_profiles(source_uuid, target_uuid)` SQL function that atomically:

1. Transfers `battle_reports.attacker_id` references
2. Transfers `battle_reports.defender_id` references
3. Transfers `battle_reports.reported_by` references
4. Transfers `profile_factions` rows (with `ON CONFLICT DO NOTHING` for duplicates)
5. Transfers `season_participants` rows if the table exists (with `ON CONFLICT DO NOTHING`)
6. If source has `user_id`, calls `unlink_profile(source_uuid)` first
7. Deletes the source profile

```sql
CREATE OR REPLACE FUNCTION public.merge_profiles(source_uuid UUID, target_uuid UUID)
RETURNS void AS $$
BEGIN
  IF source_uuid = target_uuid THEN
    RAISE EXCEPTION 'Cannot merge a profile into itself';
  END IF;

  -- Verify both profiles exist
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = source_uuid) THEN
    RAISE EXCEPTION 'Source profile not found';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = target_uuid) THEN
    RAISE EXCEPTION 'Target profile not found';
  END IF;

  -- Unlink source if linked
  IF (SELECT user_id FROM profiles WHERE id = source_uuid) IS NOT NULL THEN
    PERFORM unlink_profile(source_uuid);
  END IF;

  -- Transfer battle report references
  UPDATE battle_reports SET attacker_id = target_uuid WHERE attacker_id = source_uuid;
  UPDATE battle_reports SET defender_id = target_uuid WHERE defender_id = source_uuid;
  UPDATE battle_reports SET reported_by = target_uuid WHERE reported_by = source_uuid;

  -- Transfer faction associations (skip duplicates)
  INSERT INTO profile_factions (profile_id, faction_id)
    SELECT target_uuid, faction_id FROM profile_factions WHERE profile_id = source_uuid
    ON CONFLICT DO NOTHING;
  DELETE FROM profile_factions WHERE profile_id = source_uuid;

  -- Delete source profile
  DELETE FROM profiles WHERE id = source_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### RLS Policies

No new RLS policies needed — the function runs as `SECURITY DEFINER` and the server action verifies admin role before calling it.

### New DELETE Policy on Profiles

Currently there is no DELETE policy on profiles. Add one for admin use:

```sql
CREATE POLICY "Admins can delete any profile"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );
```

## Implementation

### Key Files

| Action | File | Description |
|---|---|---|
| Create | `supabase/migrations/XXXXXX_merge_profiles.sql` | `merge_profiles()` function and DELETE policy |
| Modify | `src/app/admin/user-management/[profileId]/edit/page.tsx` | Fetch all profiles for merge target selection |
| Modify | `src/app/admin/user-management/[profileId]/edit/admin-edit-profile-form.tsx` | Add merge UI in Admin Actions section |
| Modify | `src/app/admin/user-management/[profileId]/edit/actions.ts` | Add `mergeProfilesAction` server action |

### Approach

#### 1. Merge SQL Function

Create the `merge_profiles()` function as described above. It runs in a single transaction so all transfers are atomic.

#### 2. Merge UI

Replace the "No additional actions available" placeholder in the Admin Actions section with a merge form:

- Select dropdown listing all profiles except the current one (show `display_name` and linked/unlinked status)
- Preview section showing what will be transferred:
  - Count of battle reports as attacker
  - Count of battle reports as defender
  - Count of battle reports as reporter
  - Faction associations
- Confirmation button: "Merge into [target name]"
- Warning text explaining the source profile will be permanently deleted

#### 3. Server Action

```ts
mergeProfilesAction(prevState, formData) → ProfileFormState
```

1. Verify caller is admin
2. Extract `source_profile_id` and `target_profile_id`
3. Validate source !== target
4. Call `supabase.rpc('merge_profiles', { source_uuid, target_uuid })`
5. Redirect to target profile's edit page on success

## Key Design Decisions

1. **SQL function over application-level transfers** — Running the merge as a single SQL function ensures atomicity. If any step fails, the entire merge rolls back. This prevents partial merges that leave orphaned data.

2. **Unlink before delete** — If the source profile is linked to an auth account, the merge unlinks it first. This cleans up the `user_roles` entries and frees the auth user to be linked to a different profile if needed.

3. **Confirmation step** — Merging is destructive and irreversible. Showing a preview of what will be transferred gives the admin a chance to verify they selected the correct profiles.

4. **Target selection shows all profiles** — The admin can merge into any profile, not just linked ones. This handles the case where the admin wants to consolidate two unlinked profiles.

## Notes

- This feature should be implemented after the "Season Participants" feature so that season participation records can also be transferred.
- The merge function can be extended to transfer additional data as new features are added (e.g., comments, achievements).
- Consider adding an audit log entry for merge operations in the future.
