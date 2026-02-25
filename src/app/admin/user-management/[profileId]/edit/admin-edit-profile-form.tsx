'use client'

import ImageUpload from '@/components/image-upload'
import { createClient } from '@/lib/supabase/client'
import FactionSelector from '@/modules/faction/components/faction-selector'
import { type ProfileFormState, validateBio, validateDisplayName } from '@/modules/profile/validation'
import type { Faction } from '@/types/faction'
import type { Profile } from '@/types/profile'
import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import { adminUpdateProfile, unlinkProfileAction } from './actions'
import { toggleRole, type ToggleRoleState } from '../../actions'

type AdminEditProfileFormProps = {
  profile: Profile
  factions: Faction[]
  selectedFactionIds: string[]
  currentRoles: string[]
  assignableRoles: string[]
  isSelf: boolean
}

const PROTECTED_ROLES = ['user']

function RemoveRoleButton({
  userId,
  role,
  onResult,
}: {
  userId: string
  role: string
  onResult: (state: ToggleRoleState) => void
}) {
  const [state, formAction, isPending] = useActionState(toggleRole, null)

  useEffect(() => {
    if (state) onResult(state)
  }, [state, onResult])

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="role" value={role} />
      <button
        type="submit"
        disabled={isPending}
        className="badge badge-sm gap-1 cursor-pointer hover:badge-error"
        aria-label={`Remove ${role} role`}
      >
        {role}
        {isPending ? (
          <span className="loading loading-spinner w-3 h-3" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        )}
      </button>
    </form>
  )
}

function AddRoleButton({
  userId,
  role,
  onResult,
}: {
  userId: string
  role: string
  onResult: (state: ToggleRoleState) => void
}) {
  const [state, formAction, isPending] = useActionState(toggleRole, null)

  useEffect(() => {
    if (state) onResult(state)
  }, [state, onResult])

  return (
    <li>
      <form action={formAction}>
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="role" value={role} />
        <button type="submit" disabled={isPending} className="w-full text-left">
          {isPending ? <span className="loading loading-spinner loading-xs" /> : role}
        </button>
      </form>
    </li>
  )
}

export default function AdminEditProfileForm({
  profile,
  factions,
  selectedFactionIds,
  currentRoles,
  assignableRoles,
  isSelf,
}: AdminEditProfileFormProps) {
  const [profileState, profileAction, profilePending] = useActionState<ProfileFormState, FormData>(
    adminUpdateProfile,
    null,
  )
  const [unlinkState, unlinkAction, unlinkPending] = useActionState<ProfileFormState, FormData>(
    unlinkProfileAction,
    null,
  )
  const displayNameRef = useRef<HTMLInputElement>(null)
  const bioRef = useRef<HTMLTextAreaElement>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarError, setAvatarError] = useState<string | undefined>()
  const [uploading, setUploading] = useState(false)
  const [roleAlert, setRoleAlert] = useState<ToggleRoleState>(null)

  function handleRoleResult(state: ToggleRoleState) {
    setRoleAlert(state)
  }

  async function handleSubmit(formData: FormData) {
    const displayName = (formData.get('display_name') as string) ?? ''
    const bio = (formData.get('bio') as string) ?? ''

    const displayNameError = validateDisplayName(displayName)
    if (displayNameError) {
      displayNameRef.current?.setCustomValidity(displayNameError)
      displayNameRef.current?.reportValidity()
      return
    }
    displayNameRef.current?.setCustomValidity('')

    const bioError = validateBio(bio)
    if (bioError) {
      bioRef.current?.setCustomValidity(bioError)
      bioRef.current?.reportValidity()
      return
    }
    bioRef.current?.setCustomValidity('')

    if (avatarFile) {
      setAvatarError(undefined)
      setUploading(true)

      try {
        const supabase = createClient()
        const ext = avatarFile.name.split('.').pop() ?? 'jpg'
        const filePath = `${profile.id}/avatar.${ext}`

        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile, {
          upsert: true,
          contentType: avatarFile.type,
        })

        if (uploadError) {
          setAvatarError('Failed to upload image. Please try again.')
          setUploading(false)
          return
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(filePath)

        formData.set('avatar_url', `${publicUrl}?t=${Date.now()}`)
      } catch {
        setAvatarError('Failed to upload image. Please try again.')
        setUploading(false)
        return
      }

      setUploading(false)
    }

    startTransition(() => {
      profileAction(formData)
    })
  }

  const isSubmitting = profilePending || uploading
  const displayNameFieldError = profileState?.errors?.display_name
  const bioFieldError = profileState?.errors?.bio
  const factionFieldError = profileState?.errors?.faction_ids
  const isLinked = !!profile.user_id

  const removableRoles = currentRoles.filter((r) => assignableRoles.includes(r))
  const protectedRoles = currentRoles.filter((r) => PROTECTED_ROLES.includes(r))
  const availableRoles = assignableRoles.filter((r) => !currentRoles.includes(r))

  return (
    <>
      {profileState?.success && (
        <div role="alert" className="alert alert-success">
          <span>{profileState.success}</span>
        </div>
      )}
      {profileState?.error && (
        <div role="alert" className="alert alert-error">
          <span>{profileState.error}</span>
        </div>
      )}

      <form action={handleSubmit} className="flex flex-col gap-6">
        <input type="hidden" name="target_profile_id" value={profile.id} />

        {/* Section 1: Profile */}
        <div>
          <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">Profile</h2>
          <fieldset className="fieldset bg-base-300 rounded-box p-5">
            <div className="mb-4">
              <ImageUpload
                currentImageUrl={profile.avatar_url}
                displayName={profile.display_name}
                onFileSelect={setAvatarFile}
                error={avatarError}
              />
            </div>

            <label className="label" htmlFor="display_name">
              Display Name
            </label>
            <input
              ref={displayNameRef}
              id="display_name"
              name="display_name"
              type="text"
              defaultValue={profile.display_name}
              placeholder="Display name"
              className={`input input-lg input-bordered w-full ${displayNameFieldError ? 'input-error' : ''}`}
              required
              minLength={2}
              maxLength={50}
              onChange={() => displayNameRef.current?.setCustomValidity('')}
            />
            {displayNameFieldError && <p className="mt-1 text-sm text-error">{displayNameFieldError}</p>}

            <label className="label" htmlFor="bio">
              Bio
            </label>
            <textarea
              ref={bioRef}
              id="bio"
              name="bio"
              defaultValue={profile.bio ?? ''}
              placeholder="Bio (optional)"
              className={`textarea textarea-lg textarea-bordered w-full ${bioFieldError ? 'textarea-error' : ''}`}
              maxLength={500}
              rows={4}
              onChange={() => bioRef.current?.setCustomValidity('')}
            />
            {bioFieldError && <p className="mt-1 text-sm text-error">{bioFieldError}</p>}
          </fieldset>
        </div>

        {/* Section 2: Admin Settings */}
        <div>
          <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">Admin Settings</h2>
          <fieldset className="fieldset bg-base-300 rounded-box p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="link_id">
                  Link ID
                </label>
                <input
                  id="link_id"
                  name="link_id"
                  type="text"
                  defaultValue={profile.link_id ?? ''}
                  placeholder="Discord user ID"
                  className="input input-lg input-bordered w-full"
                />
                <p className="text-xs text-base-content/50 mt-1">
                  Used to auto-link this profile when the user signs in via Discord.
                </p>
              </div>

              <div>
                <label className="label" htmlFor="role">
                  League Role
                </label>
                <select
                  id="role"
                  name="role"
                  defaultValue={profile.role}
                  className="select select-lg select-bordered w-full"
                >
                  <option value="member">Member</option>
                  <option value="organizer">Organizer</option>
                </select>
              </div>
            </div>
          </fieldset>
        </div>

        {/* Section 3: Factions */}
        <div>
          <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">Factions</h2>
          <fieldset className="fieldset bg-base-300 rounded-box p-5">
            <FactionSelector factions={factions} selectedIds={selectedFactionIds} error={factionFieldError} />
          </fieldset>
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isSubmitting}>
          {isSubmitting ? <span className="loading loading-spinner loading-md" /> : 'Save Changes'}
        </button>
      </form>

      {/* Section 4: Auth Roles */}
      {isLinked && (
        <div className='pt-6'>
          <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">Auth Roles</h2>
          <fieldset className="fieldset bg-base-300 rounded-box p-5">
            {isSelf && (
              <div role="alert" className="alert alert-warning mb-4">
                <span>You cannot modify your own roles.</span>
              </div>
            )}

            {roleAlert?.success && (
              <div role="alert" className="alert alert-success mb-4">
                <span>{roleAlert.success}</span>
              </div>
            )}

            {roleAlert?.error && (
              <div role="alert" className="alert alert-error mb-4">
                <span>{roleAlert.error}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {protectedRoles.map((role) => (
                <span key={role} className="badge badge-ghost">{role}</span>
              ))}

              {isSelf
                ? removableRoles.map((role) => (
                    <span key={role} className="badge badge-outline">{role}</span>
                  ))
                : removableRoles.map((role) => (
                    <RemoveRoleButton key={role} userId={profile.user_id!} role={role} onResult={handleRoleResult} />
                  ))}

              {!isSelf && availableRoles.length > 0 && (
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="badge badge-dash cursor-pointer hover:badge-success"
                    aria-label="Add role"
                  >
                    +
                  </div>
                  <ul tabIndex={0} className="dropdown-content menu bg-base-200 rounded-box z-10 w-40 p-2 shadow-sm">
                    {availableRoles.map((role) => (
                      <AddRoleButton key={role} userId={profile.user_id!} role={role} onResult={handleRoleResult} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </fieldset>
        </div>
      )}

      {/* Section 5: Link Status */}
      <div className='pt-6'>
        <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">Link Status</h2>
        <fieldset className="fieldset bg-base-300 rounded-box p-5">
          {unlinkState?.success && (
            <div role="alert" className="alert alert-success mb-4">
              <span>{unlinkState.success}</span>
            </div>
          )}

          {unlinkState?.error && (
            <div role="alert" className="alert alert-error mb-4">
              <span>{unlinkState.error}</span>
            </div>
          )}

          {isLinked ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="badge badge-success badge-sm mr-2">Linked</span>
                <span className="text-sm text-base-content/70">Auth account connected</span>
              </div>
              {!isSelf && (
                <form action={unlinkAction}>
                  <input type="hidden" name="profile_id" value={profile.id} />
                  <button type="submit" className="btn btn-error btn-sm btn-outline" disabled={unlinkPending}>
                    {unlinkPending ? <span className="loading loading-spinner loading-xs" /> : 'Unlink'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div>
              <span className="badge badge-warning badge-sm mr-2">Unlinked</span>
              <span className="text-sm text-base-content/70">
                No auth account — {profile.link_id ? 'will auto-link on matching Discord sign-in' : 'set a Link ID to enable auto-linking'}
              </span>
            </div>
          )}
        </fieldset>
      </div>
    </>
  )
}
