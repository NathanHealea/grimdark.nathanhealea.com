'use client'

import { FormAction } from '@/types'
import { useActionState } from 'react'
import { CreateUser, CreateUserFormState } from './types'

interface CreateUserFormProps {
  displayAbove?: React.ReactNode
  action: FormAction<CreateUser>
}

export default function CreateUserForm(props: CreateUserFormProps) {
  const { action } = props

  const [state, formAction, isPending] = useActionState(action, {} as CreateUserFormState)

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

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </>
  )
}
