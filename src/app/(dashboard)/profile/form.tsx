'use client'

import { FormAction } from '@/types/form.types'
import { useActionState } from 'react'
import { EditProfile, EditProfileFormState } from './types'

interface EditProfileFormProps {
  displayAbove?: React.ReactNode
  children?: React.ReactNode
  action: FormAction<EditProfile>
  user: EditProfile
}

export default function EditProfileForm(props: EditProfileFormProps) {
  const { action, user, children } = props

  const [state, formAction, isPending] = useActionState(action, {
    state: user as EditProfile,
  } as EditProfileFormState)

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
              disabled
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

        <fieldset className="fieldset bg-base-200  rounded-bo border border-warning rounded-lg p-4 w-full gap-4">
          <div>
            <h2 className="text-lg font-semibold text-warning ">Password</h2>
            <p className="text-sm text-warning">Update the password for {state.state?.username}.</p>
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
              <input id="password" name="password" type="password"  placeholder="Password" />
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
        </fieldset>

        {children}

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
          {isPending ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </form>
    </>
  )
}
