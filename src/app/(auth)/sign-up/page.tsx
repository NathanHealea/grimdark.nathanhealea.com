'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signUp } from '../actions'

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState(signUp, null)

  return (
    <div className="card w-full max-w-md bg-base-200 shadow-xl">
      <div className="card-body gap-4">
        <h1 className="card-title text-2xl">Sign Up</h1>

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

            <label className="label" htmlFor="password">
              Password
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
          </fieldset>

          <button type="submit" className="btn btn-primary w-full" disabled={pending}>
            {pending ? <span className="loading loading-spinner loading-sm" /> : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm">
          Already have an account?{' '}
          <Link href="/sign-in" className="link link-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
