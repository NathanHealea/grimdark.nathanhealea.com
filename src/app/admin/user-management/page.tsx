import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/profile'
import UserManagementTable from './user-management-table'

const PROTECTED_ROLES = ['user']

export default async function UserManagementPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: profiles }, { data: userRoles }, { data: roles }] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('user_roles').select('user_id, roles(name)'),
    supabase.from('roles').select('*'),
  ])

  // Build a map of user_id → role names
  const roleMap = new Map<string, string[]>()
  for (const ur of userRoles ?? []) {
    const roleName = (ur.roles as unknown as { name: string }).name
    const existing = roleMap.get(ur.user_id) ?? []
    existing.push(roleName)
    roleMap.set(ur.user_id, existing)
  }

  // Combine profiles with their roles
  const usersWithRoles = ((profiles as Profile[]) ?? []).map((p) => ({
    id: p.id,
    profile_id: p.profile_id,
    display_name: p.display_name,
    avatar_url: p.avatar_url,
    roles: roleMap.get(p.id) ?? ['user'],
  }))

  // Assignable roles — exclude protected roles that cannot be toggled
  const assignableRoles = (roles ?? [])
    .map((r) => r.name as string)
    .filter((name) => !PROTECTED_ROLES.includes(name))

  return (
    <main className="flex flex-col items-center -mt-72 pt-72 min-h-screen w-full">
      <div className="w-full px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="mt-2 text-base-content/60">
              Manage user roles across the league.
            </p>
          </div>

          <UserManagementTable
            users={usersWithRoles}
            currentUserId={user?.id ?? ''}
            assignableRoles={assignableRoles}
          />
        </div>
      </div>
    </main>
  )
}
