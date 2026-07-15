# Change Profile Picture

**Epic:** Member Profiles
**Type:** Feature
**Status:** Completed

## Summary

Allow members to upload a custom profile picture from the edit profile page. Users can select or drag-and-drop an image file, see a preview before saving, and on save the image is uploaded to Supabase Storage. The resulting public URL is saved to the `avatar_url` column on the `profiles` table, replacing any OAuth-provided avatar.

## Acceptance Criteria

- [x] The edit profile page includes a profile picture section with the current avatar displayed
- [x] Users can select an image file via a file input or drag-and-drop
- [x] Only image files are accepted (JPEG, PNG, WebP) with a maximum size of 2 MB
- [x] A preview of the selected image is shown before saving
- [x] On save, the image is uploaded to a Supabase Storage bucket and the public URL is stored in `avatar_url`
- [x] The previous uploaded avatar file is overwritten via upsert on re-upload
- [x] Validation errors (wrong file type, file too large) are displayed to the user
- [x] The updated avatar is reflected immediately on the profile page and navbar after saving

## Supabase Storage

### Bucket: `avatars`

- Public Supabase Storage bucket named `avatars`
- File path convention: `{user_id}/avatar.{ext}` (one file per user, overwritten on re-upload via `upsert: true`)
- Cache-busting query parameter (`?t=timestamp`) appended to the public URL to avoid stale CDN caches

### Storage Policies

- **SELECT (read):** Public — anyone can view avatar images
- **INSERT:** Authenticated users can upload to their own folder (`auth.uid()::text = (storage.foldername(name))[1]`)
- **UPDATE:** Authenticated users can overwrite files in their own folder
- **DELETE:** Authenticated users can delete files in their own folder

### Migration: `supabase/migrations/20260219200000_create_avatars_bucket.sql`

- Creates the `avatars` bucket with `public = true`
- Creates RLS policies for SELECT (public), INSERT, UPDATE, and DELETE (scoped to user's folder)

### Local Dev Config: `supabase/config.toml`

- `[storage.buckets.avatars]` section with `public = true`, `file_size_limit = "2MiB"`, allowed MIME types

## Implementation

### Image Upload Component: `src/components/image-upload.tsx`

A reusable `'use client'` component for selecting and previewing an image before upload.

- **Props:** `currentImageUrl`, `displayName`, `onFileSelect`, `error`
- Renders the current avatar via the `Avatar` component with a hover overlay "Change" button
- Supports click-to-select (hidden file input) and drag-and-drop with visual feedback
- Client-side validation: JPEG/PNG/WebP only, max 2 MB
- Generates a local preview URL via `URL.createObjectURL`, cleaned up on unmount/change
- "Remove new photo" button to clear the selection
- Inline error display for rejected files

### Edit Profile Form: `src/app/profile/edit/edit-profile-form.tsx`

- `ImageUpload` component rendered above the form fields
- `useState` for selected `File | null` and avatar upload error
- Async `handleSubmit`:
  1. Runs existing client-side validation
  2. If a file is selected, uploads via `supabase.storage.from('avatars').upload(...)` with `upsert: true`
  3. Gets the public URL via `getPublicUrl()` with cache-bust suffix
  4. Sets `avatar_url` on the FormData
  5. Calls `formAction(formData)` inside `startTransition`

### Edit Profile Page: `src/app/profile/edit/page.tsx`

- Passes `userId={auth.user.id}` to `EditProfileForm` for the storage upload path

### Server Action: `src/app/profile/edit/actions.ts`

- Reads optional `avatar_url` from FormData
- If present, includes it in the `.update()` call alongside `display_name` and `bio`
- Calls `revalidatePath('/', 'layout')` after successful update to refresh the navbar avatar
