'use client'

import DiscordIcon from '@/components/icons/discord-icon'
import GoogleIcon from '@/components/icons/google-icon'
import Link from 'next/link'
import { useActionState } from 'react'
import { signIn, signInWithDiscord, signInWithGoogle } from '../actions'

export default function SignInPage() {
  const [state, formAction, pending] = useActionState(signIn, null)

  return (
    <div className="card w-full max-w-md bg-base-200 shadow-xl">
      <div className="card-body gap-4">
        <h1 className="card-title text-2xl">Sign In</h1>

        {state?.error && (
          <div role="alert" className="alert alert-error">
            <span>{state.error}</span>
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
            />
          </fieldset>

          <button type="submit" className="btn btn-primary w-full" disabled={pending}>
            {pending ? <span className="loading loading-spinner loading-sm" /> : 'Sign In'}
          </button>
        </form>

        <div className="divider">OR</div>

        <form action={signInWithGoogle}>
          <button type="submit" className="btn btn-outline w-full">
            <GoogleIcon className="h-5 w-5" />
            Continue with Google
          </button>
        </form>

        <form action={signInWithDiscord}>
          <button type="submit" className="btn btn-outline w-full">
            <DiscordIcon className="h-5 w-5" />
            Continue with Discord
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
