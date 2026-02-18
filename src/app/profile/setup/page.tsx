'use client'

import { useActionState } from 'react'
import { setupProfile } from './actions'

export default function ProfileSetupPage() {
  const [state, formAction, pending] = useActionState(setupProfile, null)

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="card w-full max-w-md bg-base-200 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">Set Up Your Profile</h1>
          <p className="text-base-content/70">Choose a display name to get started. You can add more details later.</p>

          {state?.error && (
            <div role="alert" className="alert alert-error">
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="flex flex-col gap-4">
            <label className="fieldset-label" htmlFor="display_name">
              Display Name
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              placeholder="Your display name"
              className="input input-bordered w-full"
              required
              minLength={2}
              maxLength={50}
            />

            <button type="submit" className="btn btn-primary w-full" disabled={pending}>
              {pending ? <span className="loading loading-spinner loading-sm" /> : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
