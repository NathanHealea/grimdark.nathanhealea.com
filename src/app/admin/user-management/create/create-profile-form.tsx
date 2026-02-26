'use client'

import FactionSelector from '@/modules/faction/components/faction-selector'
import { type ProfileFormState, validateDisplayName } from '@/modules/profile/validation'
import type { Faction } from '@/types/faction'
import { useActionState, useRef } from 'react'
import { createUnlinkedProfile } from './actions'

type CreateProfileFormProps = {
  factions: Faction[]
}

export default function CreateProfileForm({ factions }: CreateProfileFormProps) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(createUnlinkedProfile, null)
  const displayNameRef = useRef<HTMLInputElement>(null)

  function handleSubmit(formData: FormData) {
    const value = (formData.get('display_name') as string) ?? ''
    const error = validateDisplayName(value)

    if (error) {
      displayNameRef.current?.setCustomValidity(error)
      displayNameRef.current?.reportValidity()
      return
    }

    displayNameRef.current?.setCustomValidity('')
    formAction(formData)
  }

  const displayNameError = state?.errors?.display_name
  const factionFieldError = state?.errors?.faction_ids

  return (
    <>
      {state?.success && (
        <div role="alert" className="alert alert-success">
          <span>{state.success}</span>
        </div>
      )}
      {state?.error && (
        <div role="alert" className="alert alert-error">
          <span>{state.error}</span>
        </div>
      )}

      <form action={handleSubmit} className="flex flex-col gap-6">
        {/* Section 1: Profile */}
        <div>
          <h2 className="ornament section-header">Profile</h2>
          <fieldset className="form-section">
            <label className="label" htmlFor="display_name">
              Display Name
            </label>
            <input
              ref={displayNameRef}
              id="display_name"
              name="display_name"
              type="text"
              placeholder="Player display name"
              className={`input input-lg input-bordered w-full ${displayNameError ? 'input-error' : ''}`}
              required
              minLength={2}
              maxLength={50}
              onChange={() => displayNameRef.current?.setCustomValidity('')}
            />
            {displayNameError && <p className="form-error">{displayNameError}</p>}

            <label className="label" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              placeholder="Bio (optional)"
              className="textarea textarea-lg textarea-bordered w-full"
              maxLength={500}
              rows={4}
            />
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
                  defaultValue="member"
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
            <FactionSelector factions={factions} error={factionFieldError} />
          </fieldset>
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={pending}>
          {pending ? <span className="loading loading-spinner loading-md" /> : 'Create Profile'}
        </button>
      </form>
    </>
  )
}
