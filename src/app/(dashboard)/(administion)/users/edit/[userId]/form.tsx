'use client'

import { FormAction } from '@/types'
import { useActionState } from 'react'
import { EditUser, EditUserFormState } from './types'

interface EditUserFormProps {
  displayAbove?: React.ReactNode
  children?: React.ReactNode
  action: FormAction<EditUser>
  user: EditUser
}

export default function EditUserForm(props: EditUserFormProps) {
  const { action, user, children } = props

  const [state, formAction, isPending] = useActionState(action, {
    state: user as EditUser,
  } as EditUserFormState)

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

        {/* Avatar */}
        {/* TODO: Implement uploading an image for an avatar. */}

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

        {/* First Name */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="first_name" className={`label ${state.errors?.first_name ? 'text-error' : ''}`}>
            <span className="label-text">First Name</span>
          </label>
          <label className={`input w-full ${state.errors?.first_name ? 'input-error' : 'validator'}`}>
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </g>
            </svg>

            <input
              id="first_name"
              name="first_name"
              type="text"
              placeholder="Enter the users first name."
              defaultValue={state.state?.first_name || ''}
            />
          </label>
          {state.errors?.first_name && (
            <ul className="list text-error">
              {state.errors.first_name.map((error, index) => (
                <li className="list-row" key={index}>
                  {error}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="last_name" className={`label ${state.errors?.last_name ? 'text-error' : ''}`}>
            <span className="label-text">Last Name</span>
          </label>
          <label className={`input w-full ${state.errors?.last_name ? 'input-error' : 'validator'}`}>
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </g>
            </svg>

            <input
              id="last_name"
              name="last_name"
              type="text"
              placeholder="Enter the users last name."
              defaultValue={state.state?.last_name || ''}
            />
          </label>
          {state.errors?.last_name && (
            <ul className="list text-error">
              {state.errors.last_name.map((error, index) => (
                <li className="list-row" key={index}>
                  {error}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="bio" className={`label ${state.errors?.bio ? 'text-error' : ''}`}>
            <span className="label-text">Bio</span>
          </label>

          <textarea
            rows={8}
            id="bio"
            name="bio"
            className="textarea w-full"
            placeholder="Enter the users bio."
            defaultValue={state.state?.bio || ''}
          />
          {state.errors?.bio && (
            <ul className="list text-error">
              {state.errors.bio.map((error, index) => (
                <li className="list-row" key={index}>
                  {error}
                </li>
              ))}
            </ul>
          )}
        </div>

        {children}

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
          {isPending ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </form>
    </>
  )
}
