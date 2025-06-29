import { Errors } from '@/types/form.types'
import { Login } from './types'

export async function validateLogin(Login: Login): Promise<{ errors: Errors; success: boolean }> {
  const errors: Errors = {}
  let success = true

  try {

    // Validate email
    if (!Login.email) {
      errors.email = ['Email is required.']
      success = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Login.email)) {
      errors.email = ['Invalid email format.']
      success = false
    }
    // Check if email is already Logined (this is a placeholder, actual implementation would require a database check)

    // Validate password
    if (!Login.password) {
      errors.password = ['Password is required.']
      success = false
    } else if (Login.password.length < 6) {
      errors.password = ['Password must be at least 6 characters long.']
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
