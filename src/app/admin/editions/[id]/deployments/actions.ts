'use server'

import { hasAnyRole } from '@/lib/supabase/roles'
import { createClient } from '@/lib/supabase/server'
import type { FormState } from '@/types/forms'
import { revalidatePath } from 'next/cache'

export type DeploymentFormState = FormState<{
  name: string
}>

export async function createDeployment(
  prevState: DeploymentFormState,
  formData: FormData
): Promise<DeploymentFormState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  const canManage = await hasAnyRole(user.id, ['admin', 'organizer'])
  if (!canManage) {
    return { error: 'Only admins and organizers can create deployments.' }
  }

  const editionId = Number(formData.get('edition_id'))
  const name = (formData.get('name') as string)?.trim() ?? ''

  if (!editionId) return { error: 'Invalid edition.' }

  const errors: Record<string, string> = {}
  if (!name) errors.name = 'Name is required.'

  if (Object.keys(errors).length > 0) return { errors }

  const { error } = await supabase.from('deployments').insert({ edition_id: editionId, name })

  if (error) {
    if (error.code === '23505') {
      return { errors: { name: 'A deployment with this name already exists in this edition.' } }
    }
    console.error('Failed to create deployment:', error)
    return { error: 'Failed to create deployment. Please try again.' }
  }

  revalidatePath('/', 'layout')
  return { success: 'Deployment created.' }
}

export async function updateDeployment(
  prevState: DeploymentFormState,
  formData: FormData
): Promise<DeploymentFormState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  const canManage = await hasAnyRole(user.id, ['admin', 'organizer'])
  if (!canManage) {
    return { error: 'Only admins and organizers can update deployments.' }
  }

  const deploymentId = Number(formData.get('deployment_id'))
  const name = (formData.get('name') as string)?.trim() ?? ''

  if (!deploymentId) return { error: 'Invalid deployment.' }

  const errors: Record<string, string> = {}
  if (!name) errors.name = 'Name is required.'

  if (Object.keys(errors).length > 0) return { errors }

  const { error } = await supabase.from('deployments').update({ name }).eq('id', deploymentId)

  if (error) {
    if (error.code === '23505') {
      return { errors: { name: 'A deployment with this name already exists in this edition.' } }
    }
    console.error('Failed to update deployment:', error)
    return { error: 'Failed to update deployment. Please try again.' }
  }

  revalidatePath('/', 'layout')
  return { success: 'Deployment updated.' }
}

export async function deleteDeployment(deploymentId: number): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  const canManage = await hasAnyRole(user.id, ['admin', 'organizer'])
  if (!canManage) {
    return { error: 'Only admins and organizers can delete deployments.' }
  }

  const { count, error: countError } = await supabase
    .from('battle_reports')
    .select('id', { count: 'exact', head: true })
    .eq('deployment_id', deploymentId)

  if (countError) {
    console.error('Failed to check battle report references:', countError)
    return { error: 'Failed to verify deployment usage. Please try again.' }
  }

  if ((count ?? 0) > 0) {
    return {
      error: `Cannot delete this deployment: ${count} battle report${count === 1 ? '' : 's'} reference${count === 1 ? 's' : ''} it. Edit those reports to a different deployment first.`,
    }
  }

  const { error } = await supabase.from('deployments').delete().eq('id', deploymentId)

  if (error) {
    console.error('Failed to delete deployment:', error)
    return { error: 'Failed to delete deployment. Please try again.' }
  }

  revalidatePath('/', 'layout')
  return {}
}
