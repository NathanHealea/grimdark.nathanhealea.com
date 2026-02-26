import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/profile'
import Link from 'next/link'
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

  // Build a map of auth user_id → role names
  const roleMap = new Map<string, string[]>()
  for (const ur of userRoles ?? []) {
    const roleName = (ur.roles as unknown as { name: string }).name
    const existing = roleMap.get(ur.user_id) ?? []
    existing.push(roleName)
    roleMap.set(ur.user_id, existing)
  }

  // Combine profiles with their auth roles
  const usersWithRoles = ((profiles as Profile[]) ?? []).map((p) => ({
    id: p.id,
    user_id: p.user_id,
    profile_id: p.profile_id,
    display_name: p.display_name,
    avatar_url: p.avatar_url,
    role: p.role,
    authRoles: p.user_id ? roleMap.get(p.user_id) ?? ['user'] : [],
  }))

  // Assignable roles — exclude protected roles that cannot be toggled
  const assignableRoles = (roles ?? [])
    .map((r) => r.name as string)
    .filter((name) => !PROTECTED_ROLES.includes(name))

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-h1">User Management</h1>
              <p className="mt-2 text-base-content/60">
                Manage user roles across the league.
              </p>
            </div>
            <Link href="/admin/user-management/create" className="btn btn-primary btn-sm">
              Create Profile
            </Link>
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
