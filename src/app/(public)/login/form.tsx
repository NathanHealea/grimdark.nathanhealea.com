'use client'

import { FormAction } from '@/types/form.types'
import { redirect } from 'next/navigation'
import { useActionState } from 'react'
import { Login, LoginFormState } from './types'

interface LoginFormProps {
  displayAbove: React.ReactNode
  action: FormAction<Login>
}

export default function LoginForm(props: LoginFormProps) {
  const { action } = props

  const [state, formAction, isPending] = useActionState(action, {} as LoginFormState)

  if (state.success) {
    redirect('/dashboard')
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


        {/* Submit Button */}
        <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
          {isPending ? 'Logining...' : 'Login'}
        </button>
      </form>
    </>
  )
}
