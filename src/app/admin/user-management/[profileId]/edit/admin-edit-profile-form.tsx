'use client'

import ImageUpload from '@/components/image-upload'
import { createClient } from '@/lib/supabase/client'
import FactionSelector from '@/modules/faction/components/faction-selector'
import { type ProfileFormState, validateBio, validateDisplayName } from '@/modules/profile/validation'
import type { Faction } from '@/types/faction'
import type { Profile } from '@/types/profile'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import { adminUpdateProfile, unlinkProfileAction, linkProfileAction, mergeProfileAction, getMergePreviewAction, type MergePreviewData } from './actions'
import { toggleRole, type ToggleRoleState } from '../../actions'

type LinkableUser = {
  id: string
  email: string
  display_name: string | null
}

type MergeableProfile = {
  id: string
  display_name: string
  profile_id: number
  is_linked: boolean
}

type AdminEditProfileFormProps = {
  profile: Profile
  factions: Faction[]
  selectedFactionIds: string[]
  currentRoles: string[]
  assignableRoles: string[]
  isSelf: boolean
  mergeableProfiles: MergeableProfile[]
  linkableUsers: LinkableUser[]
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
          <XMarkIcon className="w-3 h-3" />
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
  mergeableProfiles,
  linkableUsers,
}: AdminEditProfileFormProps) {
  const [profileState, profileAction, profilePending] = useActionState<ProfileFormState, FormData>(
    adminUpdateProfile,
    null,
  )
  const [unlinkState, unlinkAction, unlinkPending] = useActionState<ProfileFormState, FormData>(
    unlinkProfileAction,
    null,
  )
  const [linkState, linkAction, linkPending] = useActionState<ProfileFormState, FormData>(linkProfileAction, null)
  const [mergeState, mergeAction, mergePending] = useActionState<ProfileFormState, FormData>(mergeProfileAction, null)
  const [mergePreview, setMergePreview] = useState<MergePreviewData>(null)
  const [mergePreviewLoading, setMergePreviewLoading] = useState(false)
  const [mergePreviewError, setMergePreviewError] = useState<string | null>(null)
  const [selectedMergeSource, setSelectedMergeSource] = useState('')
  const [showMergeConfirm, setShowMergeConfirm] = useState(false)
  const [linkSearch, setLinkSearch] = useState('')
  const [selectedLinkUser, setSelectedLinkUser] = useState<LinkableUser | null>(null)
  const [linkDropdownOpen, setLinkDropdownOpen] = useState(false)
  const linkSearchRef = useRef<HTMLInputElement>(null)
  const linkDropdownRef = useRef<HTMLDivElement>(null)
  const displayNameRef = useRef<HTMLInputElement>(null)
  const bioRef = useRef<HTMLTextAreaElement>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarError, setAvatarError] = useState<string | undefined>()
  const [uploading, setUploading] = useState(false)
  const [roleAlert, setRoleAlert] = useState<ToggleRoleState>(null)

  function handleMergeAction(formData: FormData) {
    startTransition(() => {
      setSelectedMergeSource('')
      setMergePreview(null)
      setMergePreviewError(null)
      setShowMergeConfirm(false)
      mergeAction(formData)
    })
  }

  function handleLinkAction(formData: FormData) {
    startTransition(() => {
      setLinkSearch('')
      setSelectedLinkUser(null)
      setLinkDropdownOpen(false)
      linkAction(formData)
    })
  }

  const filteredLinkUsers = linkSearch.trim()
    ? linkableUsers.filter((u) => {
        const q = linkSearch.toLowerCase()
        return u.email.toLowerCase().includes(q) || (u.display_name?.toLowerCase().includes(q) ?? false)
      })
    : linkableUsers

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (linkDropdownRef.current && !linkDropdownRef.current.contains(e.target as Node)) {
        setLinkDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
          <h2 className="ornament section-header">Profile</h2>
          <fieldset className="form-section">
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
            {displayNameFieldError && <p className="form-error">{displayNameFieldError}</p>}

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
            {bioFieldError && <p className="form-error">{bioFieldError}</p>}
          </fieldset>
        </div>

        {/* Section 2: Admin Settings */}
        <div>
          <h2 className="ornament section-header">Admin Settings</h2>
          <fieldset className="form-section">
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
          <h2 className="ornament section-header">Factions</h2>
          <fieldset className="form-section">
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
          <h2 className="ornament section-header">Auth Roles</h2>
          <fieldset className="form-section">
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
        <h2 className="ornament section-header">Link Status</h2>
        <fieldset className="form-section">
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

      {/* Section 6: Link to User (unlinked profiles only) */}
      {!isLinked && (
        <div className="pt-6">
          <h2 className="ornament section-header">Link to User</h2>
          <fieldset className="form-section">
            <p className="text-sm text-base-content/50 mb-4">
              Manually link this profile to an existing auth user. Search by email or display name.
            </p>

            {linkState?.success && (
              <div role="alert" className="alert alert-success mb-4">
                <span>{linkState.success}</span>
              </div>
            )}

            {linkState?.error && (
              <div role="alert" className="alert alert-error mb-4">
                <span>{linkState.error}</span>
              </div>
            )}

            <form action={handleLinkAction} className="flex gap-2 items-end">
              <input type="hidden" name="profile_id" value={profile.id} />
              <input type="hidden" name="auth_user_id" value={selectedLinkUser?.id ?? ''} />
              <div className="flex-1 relative" ref={linkDropdownRef}>
                <label className="label" htmlFor="link_user_search">
                  Auth User
                </label>
                <input
                  ref={linkSearchRef}
                  id="link_user_search"
                  type="text"
                  placeholder="Search by email or display name..."
                  className="input input-bordered w-full"
                  value={linkSearch}
                  onChange={(e) => {
                    setLinkSearch(e.target.value)
                    setSelectedLinkUser(null)
                    setLinkDropdownOpen(true)
                  }}
                  onFocus={() => setLinkDropdownOpen(true)}
                  autoComplete="off"
                />
                {selectedLinkUser && (
                  <p className="text-xs text-success mt-1">
                    Selected: {selectedLinkUser.email}
                    {selectedLinkUser.display_name && ` (${selectedLinkUser.display_name})`}
                  </p>
                )}
                {linkDropdownOpen && !selectedLinkUser && (
                  <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-base-200 rounded-box shadow-lg border border-base-300">
                    {filteredLinkUsers.length === 0 ? (
                      <li className="px-4 py-2 text-sm text-base-content/50">No matching users</li>
                    ) : (
                      filteredLinkUsers.slice(0, 20).map((u) => (
                        <li key={u.id}>
                          <button
                            type="button"
                            className="w-full px-4 py-2 text-left text-sm hover:bg-base-300 cursor-pointer"
                            onClick={() => {
                              setSelectedLinkUser(u)
                              setLinkSearch(u.email)
                              setLinkDropdownOpen(false)
                            }}
                          >
                            <span className="font-medium">{u.email}</span>
                            {u.display_name && (
                              <span className="text-base-content/50 ml-2">({u.display_name})</span>
                            )}
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
              <button type="submit" className="btn btn-primary" disabled={linkPending || !selectedLinkUser}>
                {linkPending ? <span className="loading loading-spinner loading-sm" /> : 'Link'}
              </button>
            </form>
          </fieldset>
        </div>
      )}

      {/* Section 7: Merge Profiles */}
      {mergeableProfiles.length > 0 && (
        <div className="pt-6">
          <h2 className="ornament section-header">Merge Profiles</h2>
          <fieldset className="form-section">
            <p className="text-sm text-base-content/50 mb-4">
              Merge another profile into this one. All battle reports, factions, and optional data from the source
              profile will be transferred here, and the source profile will be deleted.
            </p>

            {mergeState?.success && (
              <div role="alert" className="alert alert-success mb-4">
                <span>{mergeState.success}</span>
              </div>
            )}

            {mergeState?.error && (
              <div role="alert" className="alert alert-error mb-4">
                <span>{mergeState.error}</span>
              </div>
            )}

            <div className="flex gap-2 items-end mb-4">
              <div className="flex-1">
                <label className="label" htmlFor="merge_source">
                  Source Profile (will be deleted)
                </label>
                <select
                  id="merge_source"
                  className="select select-bordered w-full"
                  value={selectedMergeSource}
                  onChange={(e) => {
                    setSelectedMergeSource(e.target.value)
                    setMergePreview(null)
                    setMergePreviewError(null)
                    setShowMergeConfirm(false)
                  }}
                >
                  <option value="">Select a profile to merge...</option>
                  {mergeableProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.display_name} (#{p.profile_id}) {p.is_linked ? '' : '- Unlinked'}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                disabled={!selectedMergeSource || mergePreviewLoading}
                onClick={async () => {
                  setMergePreviewLoading(true)
                  setMergePreviewError(null)
                  setMergePreview(null)
                  setShowMergeConfirm(false)
                  const result = await getMergePreviewAction(selectedMergeSource, profile.id)
                  if (result.error) {
                    setMergePreviewError(result.error)
                  } else {
                    setMergePreview(result.data ?? null)
                  }
                  setMergePreviewLoading(false)
                }}
              >
                {mergePreviewLoading ? <span className="loading loading-spinner loading-sm" /> : 'Preview'}
              </button>
            </div>

            {mergePreviewError && (
              <div role="alert" className="alert alert-error mb-4">
                <span>{mergePreviewError}</span>
              </div>
            )}

            {mergePreview && (
              <div className="bg-base-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2">Merge Preview</h3>
                <p className="text-sm mb-3">
                  Merging <span className="font-semibold">{mergePreview.source_display_name}</span> into{' '}
                  <span className="font-semibold">{mergePreview.target_display_name}</span>
                </p>
                <ul className="text-sm space-y-1">
                  <li>Battle reports (attacker): {mergePreview.battle_reports_as_attacker}</li>
                  <li>Battle reports (defender): {mergePreview.battle_reports_as_defender}</li>
                  <li>Battle reports (reporter): {mergePreview.battle_reports_as_reporter}</li>
                  <li>Factions: {mergePreview.factions}</li>
                </ul>

                {mergePreview.has_conflicts && (
                  <div role="alert" className="alert alert-warning mt-3">
                    <span>
                      These profiles appear on opposite sides of the same battle report(s). They cannot be merged until
                      the conflicting reports are resolved.
                    </span>
                  </div>
                )}

                {!mergePreview.has_conflicts && !showMergeConfirm && (
                  <button
                    type="button"
                    className="btn btn-error btn-outline btn-sm mt-3"
                    onClick={() => setShowMergeConfirm(true)}
                  >
                    Merge Profiles
                  </button>
                )}

                {!mergePreview.has_conflicts && showMergeConfirm && (
                  <div className="mt-3 p-3 border border-error rounded-lg">
                    <p className="text-sm font-semibold text-error mb-2">
                      This action is irreversible. The source profile will be permanently deleted.
                    </p>
                    <div className="flex gap-2">
                      <form action={handleMergeAction}>
                        <input type="hidden" name="source_profile_id" value={selectedMergeSource} />
                        <input type="hidden" name="target_profile_id" value={profile.id} />
                        <button type="submit" className="btn btn-error btn-outline btn-sm" disabled={mergePending}>
                          {mergePending ? (
                            <span className="loading loading-spinner loading-sm" />
                          ) : (
                            'Confirm Merge'
                          )}
                        </button>
                      </form>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowMergeConfirm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </fieldset>
        </div>
      )}
    </>
  )
}
