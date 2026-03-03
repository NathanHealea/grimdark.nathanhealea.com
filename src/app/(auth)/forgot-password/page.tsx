'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { requestPasswordReset } from '../actions'

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, null)

  return (
    <main className="flex min-h-screen w-full -mt-72 flex-col items-center justify-center pt-72">
      <div className="card w-full max-w-lg bg-base-200 shadow-xl">
        <div className="card-body gap-4">
          <h1 className="card-title text-2xl">Reset Password</h1>

          <p className="text-sm text-base-content/60">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          {state?.error && (
            <div role="alert" className="alert alert-error">
              <span>{state.error}</span>
            </div>
          )}

          {state?.success && (
            <div role="alert" className="alert alert-success">
              <span>{state.success}</span>
            </div>
          )}

          <form action={formAction} className="flex flex-col gap-4">
            <fieldset className="fieldset">
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="input input-bordered w-full"
                required
              />
            </fieldset>

            <button type="submit" className="btn btn-primary w-full" disabled={pending}>
              {pending ? <span className="loading loading-spinner loading-sm" /> : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center text-sm">
            Remember your password?{' '}
            <Link href="/sign-in" className="link link-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
