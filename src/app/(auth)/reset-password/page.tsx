'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { updatePassword } from '../actions'

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(updatePassword, null)

  return (
    <main className="flex min-h-screen w-full -mt-72 flex-col items-center justify-center pt-72">
      <div className="card w-full max-w-lg bg-base-200 shadow-xl">
        <div className="card-body gap-4">
          <h1 className="card-title text-2xl">Set New Password</h1>

          <p className="text-sm text-base-content/60">Enter your new password below.</p>

          {state?.error && (
            <div role="alert" className="alert alert-error">
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="flex flex-col gap-4">
            <fieldset className="fieldset">
              <label className="label" htmlFor="password">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                required
                minLength={6}
              />

              <label className="label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                required
                minLength={6}
              />
            </fieldset>

            <button type="submit" className="btn btn-primary w-full" disabled={pending}>
              {pending ? <span className="loading loading-spinner loading-sm" /> : 'Reset Password'}
            </button>
          </form>

          <p className="text-center text-sm">
            <Link href="/sign-in" className="link link-primary">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
