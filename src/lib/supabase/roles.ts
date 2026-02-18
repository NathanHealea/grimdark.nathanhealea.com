import type { Role } from '@/types/role'

import { createClient } from './server'

export async function getUserRoles(userId: string): Promise<Role[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('user_roles').select('roles(name)').eq('user_id', userId)

  if (error || !data) return ['user']

  const roles = data.map((row) => (row.roles as unknown as { name: string }).name) as Role[]

  return roles.length > 0 ? roles : ['user']
}

export async function hasRole(userId: string, role: Role): Promise<boolean> {
  const roles = await getUserRoles(userId)
  return roles.includes(role)
}
