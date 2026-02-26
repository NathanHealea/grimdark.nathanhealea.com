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
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body gap-4">
        <h1 className="card-title text-2xl">Create Profile</h1>
        <p className="text-base-content/70">
          Create an unlinked profile for a player who hasn&apos;t signed up yet.
        </p>

        {state?.error && (
          <div role="alert" className="alert alert-error">
            <span>{state.error}</span>
          </div>
        )}

        <form action={handleSubmit} className="flex flex-col gap-4">
          <fieldset className="fieldset">
            <label className="label" htmlFor="display_name">
              Display Name
            </label>
            <input
              ref={displayNameRef}
              id="display_name"
              name="display_name"
              type="text"
              placeholder="Player display name"
              className={`input input-bordered w-full ${displayNameError ? 'input-error' : ''}`}
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
              className="textarea textarea-bordered w-full"
              maxLength={500}
              rows={3}
            />

            <label className="label" htmlFor="link_id">
              Link ID
            </label>
            <input
              id="link_id"
              name="link_id"
              type="text"
              placeholder="Discord user ID (optional)"
              className="input input-bordered w-full"
            />
            <p className="text-xs text-base-content/50 mt-1">
              If provided, this profile will auto-link when the user signs in via Discord.
            </p>

            <label className="label" htmlFor="role">
              League Role
            </label>
            <select
              id="role"
              name="role"
              defaultValue="member"
              className="select select-bordered w-full"
            >
              <option value="member">Member</option>
              <option value="organizer">Organizer</option>
            </select>

            <label className="fieldset-label">Factions (optional)</label>
            <FactionSelector factions={factions} error={factionFieldError} />
          </fieldset>

          <button type="submit" className="btn btn-success w-full" disabled={pending}>
            {pending ? <span className="loading loading-spinner loading-sm" /> : 'Create Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
