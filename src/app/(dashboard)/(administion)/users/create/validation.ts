import { Errors } from '@/types'
import { CreateUser } from './types'

export async function validateCreate(user: CreateUser): Promise<{ errors: Errors; success: boolean }> {
  const errors: Errors = {}
  let success = true

  try {
    // Validate username
    if (!user.username) {
      errors.username = ['Username is required.']
      success = false
    }
    // Check if user name is already taken (this is a placeholder, actual implementation would require a database check)

    // Validate email
    if (!user.email) {
      errors.email = ['Email is required.']
      success = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      errors.email = ['Invalid email format.']
      success = false
    }
    // Check if email is already taken (this is a placeholder, actual implementation would require a database check)

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
