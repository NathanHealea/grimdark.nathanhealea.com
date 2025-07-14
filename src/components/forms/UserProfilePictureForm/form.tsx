'use client'
import { createClient } from '@/lib/supabase/client'
import { Errors } from '@/types/form.types'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import userProfilePictureFormAction from './actions'
import { UserProfilePictureFormState } from './types'

interface UserProfileImageProps {
  userId: number | null
}

export default function UserProfilePictureForm(props: UserProfileImageProps) {
  const { userId } = props

  const supabase = createClient()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxFiles: 1,
    onDrop: (files) => {
      if (files.length > 0) {
        const file = files[0]

        setFormState((prevState) => ({
          ...prevState,
          state: {
            ...prevState.state,
            profilePictureFile: file,
            profilePictureUrl: URL.createObjectURL(file),
          },
          errors: {},
          success: false,
        }))
      }
    },
    onDropRejected: (fileRejections) => {
      const errors: Errors = {}
      fileRejections.forEach((fileRejection) => {
        errors[fileRejection.file.name] = fileRejection.errors.map((error) => error.message)
      })
      setFormState((prevState) => ({
        ...prevState,
        errors: {
          ...prevState.errors,
          ...errors,
        },
        success: false,
      }))
    },
  })

  // Initial state for the form
  const [formState, setFormState] = useState<UserProfilePictureFormState>({
    errors: {} as Errors,
    state: {
      profilePictureUrl: '',
      profilePictureFile: null,
    },
    success: false,
  })

  // Helper function to fetch the user's profile picture from the database
  // and update the form state with the URL of the profile picture.
  const fetchUserProfilePicture = async () => {
    const errors: Errors = {}
    let profilePictureUrl = ''

    try {
      if (!userId) {
        throw new Error('User ID is required to fetch profile picture')
      }

      const { data, error } = await supabase.from('users').select('profile_picture_url').eq('id', userId).single()

      if (error) {
        throw error
      }

      if (!data || !data.profile_picture_url) {
        throw new Error('No profile picture found for this user')
      }

      profilePictureUrl = data.profile_picture_url

    } catch (error) {
      if (error instanceof Error) {
        errors.form = [error.message]
      } else if (typeof error === 'string') {
        errors.form = [error]
      } else {
        errors.form = ['An unexpected error occurred while fetching the profile picture.']
      }
    }

    setFormState((prevState) => ({
      ...prevState,
      errors: errors,
      state: {
        ...prevState.state,
        profilePictureUrl: profilePictureUrl,
      },
    }))
  }

  // Fetch the user's profile picture when the component mounts or when the userId changes
  // This ensures that the form is populated with the user's existing profile picture if available.
  useEffect(() => {
    fetchUserProfilePicture()
  }, [userId])

  // handles saving the profile picture
  // It creates a FormData object, appends the profile picture file and user ID,
  // and calls the userProfilePictureFormAction to handle the upload.
  const handleSaveProfilePicture = async () => {
    const errors: Errors = {}

    const formData = new FormData()
    formData.append('file', formState.state.profilePictureFile as Blob)
    formData.append('user_id', userId?.toString() || '')

    const result = await userProfilePictureFormAction(formState, formData)
    if (result.errors) {
      // If there are errors, update the form state with the errors
      setFormState((prevState) => ({
        ...prevState,
        ...result,
      }))
    }

    //reset the state after a successful upload
    if (result.success) {
      // If the upload is successful, update the form state with the success message
      setFormState((prevState) => ({
        errors: {},
        state: {
          profilePictureFile: null,
          profilePictureUrl: result.state.profilePictureUrl,
        },
        success: true,
      }))
    }
  }

  return (
    <div className="flex flex-col gap-4  justify-center items-center">
      {/* Profile Picture Input */}
      <div className="flex flex-col gap-2  justify-center items-center">
        <label htmlFor="username" className={`label ${formState.errors?.profilePicture ? 'text-error' : ''}`}>
          <span className="label-text">Profile Picture</span>
        </label>
        <div
          {...getRootProps()}
          className={`input  rounded-full h-32 w-32 flex flex-justify-center items-center cursor-pointer`}
        >
          {/* Dropzone - field input field */}
          <input {...getInputProps()} />

          {/* Profile Picture */}
          {formState.state.profilePictureUrl ? (
            <Image
              width={128}
              height={128}
              src={formState.state.profilePictureUrl}
              alt="User Profile Picture"
              className="rounded-full"
            />
          ) : (
            <div className="flex justify-center items-center h-full w-full text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
            </div>
          )}
        </div>
        {/* Helper Text */}
        <div className="text-xs text-gray-500 text-center">
          {isDragActive ? 'Drop the files here ...' : 'Drag and drop a profile picture here, or click to select one'}
        </div>

        {/* Error Messages */}
        {formState.errors && (
          <div className="text-error text-xs">
            {Object.keys(formState.errors).map((key) => (
              <div key={key}>
                {formState.errors[key].map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            ))}
          </div>
        )}

        {
          /* Success Message */
          formState.success && (
            <div className="text-success text-xs">
              <p>Profile picture updated successfully!</p>
            </div>
          )
        }
      </div>

      {/* Profile Picture Actions */}
      <div className="flex flex-col gap-2 w-full justify-center items-center">
        <button type="button" className="btn btn-primary w-full" onClick={handleSaveProfilePicture}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
            />
          </svg>

          <span>Save Profile Picture</span>
        </button>
      </div>
    </div>
  )
}
