'use server'
import { createClient } from '@/lib/supabase/server'
import { UserProfilePictureFormState } from './types'
import { validateProfilePictureFile, validateUserId } from './validations'

export default async function userProfilePictureFormAction(
  initialstate: UserProfilePictureFormState,
  formData: FormData,
): Promise<UserProfilePictureFormState> {
  const state: UserProfilePictureFormState = {
    state: initialstate.state,
    errors: {} as Record<string, string[]>,
    success: false,
  }

  if (!formData) {
    return state
  }

  const file = formData.get('file') as File | null
  const userId = parseInt(formData.get('user_id') as string)

  const supabase = await createClient()

  // validate form data
  try {
    const validateUserIdResult = validateUserId(userId)
    if (validateUserIdResult) {
      throw new Error(validateUserIdResult)
    }

    const validateFileResult = validateProfilePictureFile(file)
    if (validateFileResult) {
      throw new Error(validateFileResult)
    }
  } catch (error) {
    if (error instanceof Error) {
      state.errors.form = [error.message]
    } else if (typeof error === 'string') {
      state.errors.form = [error]
    } else {
      state.errors.form = ['An unexpected error occurred while validating the form data.']
    }
    return state
  }

  // process form data
  try {
    if (!file) {
      throw new Error('No file provided for profile picture upload')
    }
    const filePath = `${userId}/profile-picture.${file.type.split('/')[1]}`
    // Upload the profile picture file
    const { data: profilePictureData, error: profilePictureError } = await supabase.storage
      .from('public-profile-pictures')
      .upload(filePath, file as Blob, {
        cacheControl: '3600',
        upsert: true,
      })

    if (profilePictureError) {
      throw new Error(`Failed to upload profile picture: ${profilePictureError.message}`)
    }

    if (!profilePictureData) {
      throw new Error('No data returned from profile picture upload')
    } else if (!profilePictureData.fullPath) {
      throw new Error('No path returned from profile picture upload')
    }

    // get profile picture URL
    const {
      data: { publicUrl } } = await supabase.storage.from('public-profile-pictures').getPublicUrl(profilePictureData.path)

    if (!publicUrl) {
      throw new Error(`Failed to get public URL for profile picture.`)
    }

    // Update the user's profile picture URL in the database
    const { error } = await supabase.from('users').update({ profile_picture_url: `${publicUrl}?v=${Date.now()}` }).eq('id', userId)

    if (error) {
      throw new Error(`Failed to update user profile picture URL: ${error.message}`)
    }

    state.state.profilePictureUrl = profilePictureData.fullPath
    state.state.profilePictureFile = null // Reset the file after successful upload
    state.success = true
  } catch (error) {
    if (error instanceof Error) {
      state.errors.form = [error.message]
    } else if (typeof error === 'string') {
      state.errors.form = [error]
    } else {
      state.errors.form = ['An unexpected error occurred while processing the form data.']
    }
    return state
  }

  return state
}

export async function userProfilePictureFormActionHandler(
  formState: UserProfilePictureFormState,
  formData: FormData,
): Promise<UserProfilePictureFormState> {

  return formState
}
