'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signIn } from '../actions'

export default function SignInPage() {
  const [state, formAction, pending] = useActionState(signIn, null)

  return (
    <div className="card w-full max-w-md bg-base-200 shadow-xl">
      <div className="card-body">
        <h1 className="card-title text-2xl">Sign In</h1>

        {state?.error && (
          <div role="alert" className="alert alert-error">
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <label className="fieldset-label" htmlFor="email">
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

          <label className="fieldset-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="input input-bordered w-full"
            required
          />

          <button type="submit" className="btn btn-primary w-full" disabled={pending}>
            {pending ? <span className="loading loading-spinner loading-sm" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="link link-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
