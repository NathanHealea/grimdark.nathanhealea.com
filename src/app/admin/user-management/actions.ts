'use server'

import { createClient } from '@/lib/supabase/server'
import { hasRole } from '@/lib/supabase/roles'
import type { FormState } from '@/types/forms'
import { revalidatePath } from 'next/cache'

export type ToggleRoleState = FormState

const PROTECTED_ROLES = ['user']

export async function toggleRole(
  prevState: ToggleRoleState,
  formData: FormData
): Promise<ToggleRoleState> {
  const userId = formData.get('userId') as string
  const role = formData.get('role') as string

  if (!userId || !role) {
    return { error: 'Missing required fields.' }
  }

  if (PROTECTED_ROLES.includes(role)) {
    return { error: `The ${role} role cannot be modified.` }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  const isAdmin = await hasRole(user.id, 'admin')
  if (!isAdmin) {
    return { error: 'You do not have permission to manage roles.' }
  }

  if (user.id === userId) {
    return { error: 'You cannot modify your own roles.' }
  }

  // Look up the role ID — validates the role exists in the database
  const { data: roleRow, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', role)
    .single()

  if (roleError || !roleRow) {
    return { error: 'Role not found.' }
  }

  // Check if the assignment already exists
  const { data: existing } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', userId)
    .eq('role_id', roleRow.id)
    .single()

  if (existing) {
    // Remove the role
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleRow.id)

    if (deleteError) {
      return { error: `Failed to remove role: ${deleteError.message}` }
    }

    revalidatePath('/admin/user-management')
    return { success: `Removed ${role} role successfully.` }
  } else {
    // Assign the role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleRow.id })

    if (insertError) {
      return { error: `Failed to assign role: ${insertError.message}` }
    }

    revalidatePath('/admin/user-management')
    return { success: `Assigned ${role} role successfully.` }
  }
}
