'use server'

import { hasAnyRole } from '@/lib/supabase/roles'
import { createClient } from '@/lib/supabase/server'
import type { FormState } from '@/types/forms'
import { revalidatePath } from 'next/cache'

export type EditionFormState = FormState<{
  name: string
  short_name: string
  description: string
  status: string
}>

const SHORT_NAME_PATTERN = /^[a-z0-9-]+$/

async function requireManager(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return 'You must be signed in.'

  const canManage = await hasAnyRole(user.id, ['admin', 'organizer'])
  if (!canManage) return 'Only admins and organizers can manage editions.'

  return null
}

export async function createEdition(prevState: EditionFormState, formData: FormData): Promise<EditionFormState> {
  const supabase = await createClient()

  const authError = await requireManager(supabase)
  if (authError) return { error: authError }

  const name = (formData.get('name') as string)?.trim() ?? ''
  const shortName = (formData.get('short_name') as string)?.trim().toLowerCase() ?? ''
  const description = (formData.get('description') as string)?.trim() ?? ''
  const status = (formData.get('status') as string) ?? 'draft'
  const isDefault = formData.get('is_default') === 'on'

  const errors: Record<string, string> = {}
  if (!name) errors.name = 'Name is required.'
  if (!shortName) errors.short_name = 'Short name is required.'
  else if (!SHORT_NAME_PATTERN.test(shortName))
    errors.short_name = 'Short name may only contain lowercase letters, numbers, and hyphens.'
  if (!['draft', 'published'].includes(status)) errors.status = 'Status must be draft or published.'

  if (Object.keys(errors).length > 0) return { errors }

  if (isDefault) {
    const { error: clearError } = await supabase.from('editions').update({ is_default: false }).eq('is_default', true)
    if (clearError) {
      console.error('Failed to clear existing default edition:', clearError)
      return { error: 'Failed to create edition. Please try again.' }
    }
  }

  const { error } = await supabase.from('editions').insert({
    name,
    short_name: shortName,
    description: description || null,
    status,
    is_default: isDefault,
  })

  if (error) {
    if (error.code === '23505') {
      return { errors: { short_name: 'An edition with this short name already exists.' } }
    }
    console.error('Failed to create edition:', error)
    return { error: 'Failed to create edition. Please try again.' }
  }

  revalidatePath('/', 'layout')
  return { success: 'Edition created.' }
}

export async function updateEdition(prevState: EditionFormState, formData: FormData): Promise<EditionFormState> {
  const supabase = await createClient()

  const authError = await requireManager(supabase)
  if (authError) return { error: authError }

  const editionId = Number(formData.get('edition_id'))
  const name = (formData.get('name') as string)?.trim() ?? ''
  const shortName = (formData.get('short_name') as string)?.trim().toLowerCase() ?? ''
  const description = (formData.get('description') as string)?.trim() ?? ''
  const status = (formData.get('status') as string) ?? 'draft'

  if (!editionId) return { error: 'Invalid edition.' }

  const errors: Record<string, string> = {}
  if (!name) errors.name = 'Name is required.'
  if (!shortName) errors.short_name = 'Short name is required.'
  else if (!SHORT_NAME_PATTERN.test(shortName))
    errors.short_name = 'Short name may only contain lowercase letters, numbers, and hyphens.'
  if (!['draft', 'published'].includes(status)) errors.status = 'Status must be draft or published.'

  if (Object.keys(errors).length > 0) return { errors }

  const { error } = await supabase
    .from('editions')
    .update({
      name,
      short_name: shortName,
      description: description || null,
      status,
    })
    .eq('id', editionId)

  if (error) {
    if (error.code === '23505') {
      return { errors: { short_name: 'An edition with this short name already exists.' } }
    }
    console.error('Failed to update edition:', error)
    return { error: 'Failed to update edition. Please try again.' }
  }

  revalidatePath('/', 'layout')
  return { success: 'Edition updated.' }
}

export async function setDefaultEdition(editionId: number): Promise<{ error?: string }> {
  const supabase = await createClient()

  const authError = await requireManager(supabase)
  if (authError) return { error: authError }

  const { error: clearError } = await supabase.from('editions').update({ is_default: false }).eq('is_default', true)
  if (clearError) {
    console.error('Failed to clear existing default edition:', clearError)
    return { error: 'Failed to set default edition. Please try again.' }
  }

  const { error } = await supabase.from('editions').update({ is_default: true }).eq('id', editionId)
  if (error) {
    console.error('Failed to set default edition:', error)
    return { error: 'Failed to set default edition. Please try again.' }
  }

  revalidatePath('/', 'layout')
  return {}
}

export async function deleteEdition(editionId: number): Promise<{ error?: string }> {
  const supabase = await createClient()

  const authError = await requireManager(supabase)
  if (authError) return { error: authError }

  const { count, error: countError } = await supabase
    .from('battle_reports')
    .select('id', { count: 'exact', head: true })
    .eq('edition_id', editionId)

  if (countError) {
    console.error('Failed to check battle report references:', countError)
    return { error: 'Failed to verify edition usage. Please try again.' }
  }

  if ((count ?? 0) > 0) {
    return {
      error: `Cannot delete this edition: ${count} battle report${count === 1 ? '' : 's'} reference${count === 1 ? 's' : ''} it. Reassign or delete those reports first. Missions and deployments for this edition will be removed with it.`,
    }
  }

  const { error } = await supabase.from('editions').delete().eq('id', editionId)

  if (error) {
    console.error('Failed to delete edition:', error)
    return { error: 'Failed to delete edition. Please try again.' }
  }

  revalidatePath('/', 'layout')
  return {}
}
