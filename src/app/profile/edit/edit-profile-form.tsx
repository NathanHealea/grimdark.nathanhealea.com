'use client'

import FactionSelector from '@/modules/faction/components/faction-selector'
import { type ProfileFormState, validateBio, validateDisplayName } from '@/modules/profile/validation'
import type { Faction } from '@/types/faction'
import type { Profile } from '@/types/profile'
import { useActionState, useRef } from 'react'
import { updateProfile } from './actions'

type EditProfileFormProps = {
  profile: Profile
  factions: Faction[]
  selectedFactionIds: string[]
}

export default function EditProfileForm({ profile, factions, selectedFactionIds }: EditProfileFormProps) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(updateProfile, null)
  const displayNameRef = useRef<HTMLInputElement>(null)
  const bioRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit(formData: FormData) {
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

    formAction(formData)
  }

  const displayNameFieldError = state?.errors?.display_name
  const bioFieldError = state?.errors?.bio
  const factionFieldError = state?.errors?.faction_ids

  return (
    <div className="card w-full max-w-md bg-base-200 shadow-xl">
      <div className="card-body gap-4">
        <h1 className="card-title text-2xl">Edit Profile</h1>
        <p className="text-base-content/70">Update your display name and bio.</p>

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
              defaultValue={profile.display_name}
              placeholder="Your display name"
              className={`input input-bordered w-full ${displayNameFieldError ? 'input-error' : ''}`}
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
              placeholder="Tell us about yourself (optional)"
              className={`textarea textarea-bordered w-full ${bioFieldError ? 'textarea-error' : ''}`}
              maxLength={500}
              rows={4}
              onChange={() => bioRef.current?.setCustomValidity('')}
            />
            {bioFieldError && <p className="mt-1 text-sm text-error">{bioFieldError}</p>}

            <label className="fieldset-label">Factions</label>
            <FactionSelector factions={factions} selectedIds={selectedFactionIds} error={factionFieldError} />
          </fieldset>

          <button type="submit" className="btn btn-success w-full" disabled={pending}>
            {pending ? <span className="loading loading-spinner loading-sm" /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
