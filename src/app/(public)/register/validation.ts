import { Errors } from '@/types/form.types'
import { Registration } from './types'

export async function validateRegistration(registration: Registration): Promise<{ errors: Errors; success: boolean }> {
  const errors: Errors = {}
  let success = true

  try {
    // Validate username
    if (!registration.username) {
      errors.username = ['Username is required.']
      success = false
    }
    // Check if user name is already taken (this is a placeholder, actual implementation would require a database check)

    // Validate email
    if (!registration.email) {
      errors.email = ['Email is required.']
      success = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registration.email)) {
      errors.email = ['Invalid email format.']
      success = false
    }
    // Check if email is already registered (this is a placeholder, actual implementation would require a database check)

    // Validate password
    if (!registration.password) {
      errors.password = ['Password is required.']
      success = false
    } else if (registration.password.length < 6) {
      errors.password = ['Password must be at least 6 characters long.']
      success = false
    }

    // Validate confirm password
    if (registration.passwordConfirmation !== registration.password) {
      errors.passwordConfirmation = ['Passwords do not match.']
      success = false
    }
  } catch (error) {
    if (error instanceof Error) {
      errors.form = [error.message]
    } else if (typeof error === 'string') {
      errors.form = [error]
    } else {
      errors.form = ['An unknown error occurred.']
    }
  }

  return { errors, success }
}
