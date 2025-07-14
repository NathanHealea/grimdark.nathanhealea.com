import { createClient } from '@/lib/supabase/server'
import { Errors } from '@/types/form.types'
import { EditProfile } from './types'

export async function validateEditProfile(user: EditProfile): Promise<{ errors: Errors; success: boolean }> {
  const errors: Errors = {}
  let success = true

  const supabase = await createClient()

  /**
   * Check if the username is already taken.
   * @param username The username to check.
   * @returns True if the username is taken, false otherwise.
   */
  const isUsernameTaken = async (username: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('id', user.id) // Exclude current user if editing
      .maybeSingle()

    if (error) {
      throw new Error(`Error checking username: ${error.message}`)
    }

    if (data) {
      return true // Username is taken
    }

    return false // Username is available
  }

  /**
   * Check if the user is trying to edit their own profile.
   * @param userId The ID of the user to check.
   * @returns True if the user is editing their own profile, false otherwise.
   */
  const isUserSelf = async (userId: number): Promise<boolean> => {
    let results = false

    try {
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        throw new Error(`Error fetching current user: ${error.message}`)
      }

      if (!currentUser) {
        throw new Error('No user is currently authenticated.')
      }

      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('id', userId)
        .maybeSingle()

      if (profileError) {
        throw new Error(`Error fetching user profile: ${profileError.message}`)
      }

      if (!userProfile) {
        throw new Error('User profile not found.')
      }

      results = true
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error checking if user is self: ${error.message}`)
      } else if (typeof error === 'string') {
        console.log(`Error checking if user is self: ${error}`)
      } else {
        console.log('An unknown error occurred while checking if user is self.')
      }
    }

    return results
  }

  const isCurrentPasswordValid = async (password: string): Promise<boolean> => {
    let results = false

    try {
      if (!password || password.trim() === '') {
        throw new Error('Current password is required.')
      }

      const { data, error } = await supabase.rpc('validate_current_password', {
        current_plain_password: password,
      })

      if (error) {
        throw error
      }

      if (!data) {
        throw new Error('Current password is invalid.')
      }

      results = true
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error validating current password: ${error.message}`)
      } else if (typeof error === 'string') {
        console.log(`Error validating current password: ${error}`)
      } else {
        console.log('An unknown error occurred while validating current password.')
      }
    }
    return results
  }

  try {
    // Check if the user is trying to edit their own profile
    if (user.id && !(await isUserSelf(user.id))) {
      errors.form = ['You can only edit your own profile.']
      success = false
      return { errors, success }
    }

    // Validate username
    if (!user.username || user.username.trim() === '') {
      errors.username = ['Username is required.']
      success = false
    } else if (await isUsernameTaken(user.username)) {
      errors.username = ['Username is already taken.']
      success = false
    }

    // Check if user name is already taken (this is a placeholder, actual implementation would require a database check)

    // Validate email
    // if (!user.email) {
    //   errors.email = ['Email is required.']
    //   success = false
    // } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    //   errors.email = ['Invalid email format.']
    //   success = false
    // }

    // Validate password change
    if (user.password) {
      // Validate current password
      if (!user.passwordCurrent || user.passwordCurrent.trim() === '') {
        errors.passwordCurrent = ['Current password is required.']
        success = false
      } else if (!(await isCurrentPasswordValid(user.passwordCurrent))) {
        errors.passwordCurrent = ['Current password is invalid.']
        success = false
      }

      // Validate new password
      if (user.password.trim().length === 0) {
        errors.password = ['Password must be at least 8 characters long.']
        success = false
      }

      // Validate password confirmation
      if (user.passwordConfirmation && user.passwordConfirmation.trim().length === 0) {
        errors.passwordConfirmation = ['Password confirmation is required.']
        success = false
      }

      // Validate that password and confirmation match
      if (user.password !== user.passwordConfirmation) {
        errors.passwordConfirmation = ['Passwords do not match.']
        success = false
      }
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
