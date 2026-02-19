'use client'

import type { Faction } from '@/types/faction'
import { useActionState, useRef } from 'react'
import { setupProfile } from './actions'
import { type ProfileFormState, validateDisplayName } from '@/modules/profile/validation'
import FactionSelector from '@/modules/faction/components/faction-selector'

export default function ProfileForm({ factions }: { factions: Faction[] }) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(setupProfile, null)
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

  const fieldError = state?.errors?.display_name
  const factionFieldError = state?.errors?.faction_ids

  return (
    <div className="card w-full max-w-md bg-base-200 shadow-xl">
      <div className="card-body">
        <h1 className="card-title text-2xl">Set Up Your Profile</h1>
        <p className="text-base-content/70">Choose a display name to get started. You can add more details later.</p>

        {state?.error && (
          <div role="alert" className="alert alert-error">
            <span>{state.error}</span>
          </div>
        )}

        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="fieldset-label" htmlFor="display_name">
              Display Name
            </label>
            <input
              ref={displayNameRef}
              id="display_name"
              name="display_name"
              type="text"
              placeholder="Your display name"
              className={`input input-bordered w-full ${fieldError ? 'input-error' : ''}`}
              required
              minLength={2}
              maxLength={50}
              onChange={() => displayNameRef.current?.setCustomValidity('')}
            />
            {fieldError && <p className="mt-1 text-sm text-error">{fieldError}</p>}
          </div>

          <div>
            <label className="fieldset-label">Factions (optional)</label>
            <FactionSelector
              factions={factions}
              error={factionFieldError}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={pending}>
            {pending ? <span className="loading loading-spinner loading-sm" /> : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
