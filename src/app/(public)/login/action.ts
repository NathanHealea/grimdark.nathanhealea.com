'use server'
import { createClient } from '@/lib/supabase/server'
import { Errors } from '@/types'
import { Login, LoginFormState } from './types'
import { validateLogin } from './validation'
import { redirect } from 'next/dist/server/api-utils';

export default async function LoginFormAction(
  initialState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const state: LoginFormState = {
    state: initialState.state,
    errors: {} as Errors,
    success: false,
  }

  try {
    const login: Login = {
      email: formData.get('email')?.toString() || '',
      password: formData.get('password')?.toString() || '',
    }

    state.state = {
      email: login.email || state.state?.email || '',
      password: '',
    }

    // Validate the Login data
    const validationResponse = await validateLogin(login)

    state.errors = validationResponse.errors

    if (validationResponse.success) {
      const supabase = await createClient()

      // Attempt to create the user in the database
      const { data, error } = await supabase.auth.signInWithPassword({
        email: login.email,
        password: login.password,
      })

      if (error) {
        state.errors.form = [error.message]
      } else {
        state.success = true
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      state.errors.form = [error.message]
    } else if (typeof error === 'string') {
      state.errors.form = [error]
    } else {
      state.errors.form = ['An unknown error occurred.']
    }
  }

  return state

  // Validate and process formData here
  // If successful, update state.success to true
  // If there are errors, populate state.errors
}
