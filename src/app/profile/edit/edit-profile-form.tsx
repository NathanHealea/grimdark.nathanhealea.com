'use client'

import ImageUpload from '@/components/image-upload'
import { createClient } from '@/lib/supabase/client'
import FactionSelector from '@/modules/faction/components/faction-selector'
import { type ProfileFormState, validateBio, validateDisplayName } from '@/modules/profile/validation'
import type { Faction } from '@/types/faction'
import type { Profile } from '@/types/profile'
import { startTransition, useActionState, useRef, useState } from 'react'
import { updateProfile } from './actions'

type EditProfileFormProps = {
  profile: Profile
  factions: Faction[]
  selectedFactionIds: string[]
}

export default function EditProfileForm({ profile, factions, selectedFactionIds }: EditProfileFormProps) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(updateProfile, null)
  const displayNameRef = useRef<HTMLInputElement>(null)
  const bioRef = useRef<HTMLTextAreaElement>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarError, setAvatarError] = useState<string | undefined>()
  const [uploading, setUploading] = useState(false)

  async function handleSubmit(formData: FormData) {
    const displayName = (formData.get('display_name') as string) ?? ''
    const bio = (formData.get('bio') as string) ?? ''

    const displayNameError = validateDisplayName(displayName)
    if (displayNameError) {
      displayNameRef.current?.setCustomValidity(displayNameError)
      displayNameRef.current?.reportValidity()
      return
    }
    displayNameRef.current?.setCustomValidity('')

    const bioError = validateBio(bio)
    if (bioError) {
      bioRef.current?.setCustomValidity(bioError)
      bioRef.current?.reportValidity()
      return
    }
    bioRef.current?.setCustomValidity('')

    if (avatarFile) {
      setAvatarError(undefined)
      setUploading(true)

      try {
        const supabase = createClient()
        const ext = avatarFile.name.split('.').pop() ?? 'jpg'
        const filePath = `${profile.id}/avatar.${ext}`

        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile, {
          upsert: true,
          contentType: avatarFile.type,
        })

        if (uploadError) {
          setAvatarError('Failed to upload image. Please try again.')
          setUploading(false)
          return
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(filePath)

        formData.set('avatar_url', `${publicUrl}?t=${Date.now()}`)
      } catch {
        setAvatarError('Failed to upload image. Please try again.')
        setUploading(false)
        return
      }

      setUploading(false)
    }

    startTransition(() => {
      formAction(formData)
    })
  }

  const isSubmitting = pending || uploading
  const displayNameFieldError = state?.errors?.display_name
  const bioFieldError = state?.errors?.bio
  const factionFieldError = state?.errors?.faction_ids

  return (
    <>
      {state?.success && (
        <div role="alert" className="alert alert-success">
          <span>{state.success}</span>
        </div>
      )}
      {state?.error && (
        <div role="alert" className="alert alert-error">
          <span>{state.error}</span>
        </div>
      )}

      <form action={handleSubmit} className="flex flex-col gap-6">
        {/* Avatar & Profile Info Section */}
        <div>
          <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">Profile</h2>
          <fieldset className="fieldset bg-base-300 rounded-box p-5">
            <div className="mb-4">
              <ImageUpload
                currentImageUrl={profile.avatar_url}
                displayName={profile.display_name}
                onFileSelect={setAvatarFile}
                error={avatarError}
              />
            </div>

            <label className="label" htmlFor="display_name">
              Display Name
            </label>
            <input
              ref={displayNameRef}
              id="display_name"
              name="display_name"
              type="text"
              defaultValue={profile.display_name}
              placeholder="Your display name"
              className={`input input-lg input-bordered w-full ${displayNameFieldError ? 'input-error' : ''}`}
              required
              minLength={2}
              maxLength={50}
              onChange={() => displayNameRef.current?.setCustomValidity('')}
            />
            {displayNameFieldError && <p className="mt-1 text-sm text-error">{displayNameFieldError}</p>}

            <label className="label" htmlFor="bio">
              Bio
            </label>
            <textarea
              ref={bioRef}
              id="bio"
              name="bio"
              defaultValue={profile.bio ?? ''}
              placeholder="Tell us about yourself (optional)"
              className={`textarea textarea-lg textarea-bordered w-full ${bioFieldError ? 'textarea-error' : ''}`}
              maxLength={500}
              rows={4}
              onChange={() => bioRef.current?.setCustomValidity('')}
            />
            {bioFieldError && <p className="mt-1 text-sm text-error">{bioFieldError}</p>}
          </fieldset>
        </div>

        {/* Factions Section */}
        <div>
          <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">Factions</h2>
          <fieldset className="fieldset bg-base-300 rounded-box p-5">
            <FactionSelector factions={factions} selectedIds={selectedFactionIds} error={factionFieldError} />
          </fieldset>
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isSubmitting}>
          {isSubmitting ? <span className="loading loading-spinner loading-md" /> : 'Save Changes'}
        </button>
      </form>
    </>
  )
}
