'use client'

import { FormAction } from '@/types/form.types'
import Link from 'next/link'
import { useActionState } from 'react'
import { Registration, RegistrationFormState } from './types'

interface RegisterFormProps {
  displayAbove: React.ReactNode
  action: FormAction<Registration>
}

export default function RegisterForm(props: RegisterFormProps) {
  const { action } = props

  const [state, formAction, isPending] = useActionState(action, {} as RegistrationFormState)

  if (state.success) {
    return (
      <div className="card bg-success text-success-content">
        <div className="card-body text-center">
          <h3 className="card-title justify-center">Registration Successful!</h3>
          <p className="">You can now log in with your new account.</p>
          <div className="card-actions justify-center">
            <Link href="/" className="btn btn-success btn-link">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {props.displayAbove && (
        <>
          {props.displayAbove}
          <div className="divider">OR</div>
        </>
      )}

      <form className="form flex flex-col gap-4" action={formAction}>
        {state.errors?.form && (
          <ul className="list text-error">
            {state.errors.form.map((error, index) => (
              <li className="list-row" key={index}>
                {error}
              </li>
            ))}
          </ul>
        )}

        {/* Username */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="username" className={`label ${state.errors?.username ? 'text-error' : ''}`}>
            <span className="label-text">Username</span>
          </label>
          <label className={`input w-full ${state.errors?.username ? 'input-error' : 'validator'}`}>
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </g>
            </svg>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="Enter your desired username."
              defaultValue={state.state?.username || ''}
            />
          </label>
          {state.errors?.username && (
            <ul className="list text-error">
              {state.errors.username.map((error, index) => (
                <li className="list-row" key={index}>
                  {error}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="email" className={`label ${state.errors?.email ? 'text-error' : ''}`}>
            <span className="label-text">Email</span>
          </label>
          <label className={`input w-full ${state.errors?.email ? 'input-error' : 'validator'}`}>
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </g>
            </svg>

            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="example@mail.com"
              defaultValue={state.state?.email || ''}
            />
          </label>
          {state.errors?.email && (
            <ul className="list text-error">
              {state.errors.email.map((error, index) => (
                <li className="list-row" key={index}>
                  {error}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="password" className={`label ${state.errors?.password ? 'text-error' : ''}`}>
            <span className="label-text">Password</span>
          </label>
          <label className={`input w-full ${state.errors?.password ? 'input-error' : 'validator'}`}>
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
                <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
              </g>
            </svg>
            <input id="password" name="password" type="password" required placeholder="Password" />
          </label>

          {state.errors?.password && (
            <ul className="list text-error">
              {state.errors.password.map((error, index) => (
                <li className="list-row" key={index}>
                  {error}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Password - Confirmation */}
        <div className="flex flex-col gap-1 w-full">
          <label
            htmlFor="passwordConfirmation"
            className={`label ${state.errors?.passwordConfirmation ? 'text-error' : ''}`}
          >
            <span className="label-text">Confirm Password</span>
          </label>
          <label className={`input w-full ${state.errors?.passwordConfirmation ? 'input-error' : 'validator'}`}>
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
                <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
              </g>
            </svg>
            <input
              id="passwordConfirmation"
              name="passwordConfirmation"
              type="password"
              required
              placeholder="Confirm Password"
            />
          </label>
          {state.errors?.passwordConfirmation && (
            <ul className="list text-error">
              {state.errors.passwordConfirmation.map((error, index) => (
                <li className="list-row" key={index}>
                  {error}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
          {isPending ? 'Registering...' : 'Register'}
        </button>
      </form>
    </>
  )
}
