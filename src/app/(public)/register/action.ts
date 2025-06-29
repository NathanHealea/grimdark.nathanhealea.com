'use server'
import { createClient } from '@/lib/supabase/server'
import { Errors } from '@/types/form.types'
import { Registration, RegistrationFormState } from './types'
import { validateRegistration } from './validation'

export default async function registrationFormAction(
  initialState: RegistrationFormState,
  formData: FormData
): Promise<RegistrationFormState> {
  const state: RegistrationFormState = {
    state: initialState.state,
    errors: {} as Errors,
    success: false,
  }

  try {
    const registration: Registration = {
      username: formData.get('username')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      password: formData.get('password')?.toString() || '',
      passwordConfirmation: formData.get('passwordConfirmation')?.toString() || '',
    }

    state.state = {
      username: registration.username || state.state?.username || '',
      email: registration.email || state.state?.email || '',
      password: '',
      passwordConfirmation: '',
    }

    // Validate the registration data
    const validationResponse = await validateRegistration(registration)

    state.errors = validationResponse.errors

    if (validationResponse.success) {
      const supabase = await createClient()

      // Attempt to create the user in the database
      const { data, error } = await supabase.auth.signUp({
        email: registration.email,
        password: registration.password,
        options: {
          data: {
            username: registration.username,
          },
        },
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
