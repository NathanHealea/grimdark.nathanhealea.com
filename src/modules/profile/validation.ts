import type { FormState } from '@/types/forms'

export type ProfileFormState = FormState<{ display_name: string; bio: string; faction_ids: string }>

const DISPLAY_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/

export function validateDisplayName(value: string): string | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return 'Display name is required.'
  }

  if (trimmed.length < 2) {
    return 'Display name must be at least 2 characters.'
  }

  if (trimmed.length > 50) {
    return 'Display name must be 50 characters or fewer.'
  }

  if (!DISPLAY_NAME_PATTERN.test(trimmed)) {
    return 'Display name can only contain letters, numbers, hyphens, and underscores.'
  }

  return null
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function validateFactionIds(ids: string[]): string | null {
  for (const id of ids) {
    if (!UUID_PATTERN.test(id)) {
      return 'Invalid faction selection.'
    }
  }
  return null
}

export function validateBio(value: string): string | null {
  if (value.length > 500) {
    return 'Bio must be 500 characters or fewer.'
  }

  return null
}
