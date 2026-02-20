import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/supabase/auth'
import { getFactions, getProfileFactionIds } from '@/modules/faction/queries'
import type { Profile } from '@/types/profile'
import { notFound } from 'next/navigation'
import AdminEditProfileForm from './admin-edit-profile-form'

const PROTECTED_ROLES = ['user']

export default async function AdminEditProfilePage({ params }: { params: Promise<{ profileId: string }> }) {
  const { profileId } = await params
  const id = Number(profileId)

  if (Number.isNaN(id)) {
    notFound()
  }

  const supabase = await createClient()
  const auth = await getAuthUser()

  const { data: profile } = await supabase.from('profiles').select('*').eq('profile_id', id).single()

  if (!profile) {
    notFound()
  }

  const typedProfile = profile as Profile
  const isSelf = auth?.user.id === typedProfile.id

  const [factions, selectedFactionIds, { data: userRoles }, { data: roles }] = await Promise.all([
    getFactions(),
    getProfileFactionIds(typedProfile.id),
    supabase.from('user_roles').select('user_id, roles(name)').eq('user_id', typedProfile.id),
    supabase.from('roles').select('*'),
  ])

  // Build current role names for the target user
  const currentRoles = (userRoles ?? []).map((ur) => (ur.roles as unknown as { name: string }).name)

  // Assignable roles — exclude protected roles
  const assignableRoles = (roles ?? [])
    .map((r) => r.name as string)
    .filter((name) => !PROTECTED_ROLES.includes(name))

  return (
    <div className="w-full px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit User</h1>
          <p className="mt-2 text-base-content/60">
            Managing profile for <span className="font-semibold">{typedProfile.display_name}</span>
          </p>
        </div>

        <AdminEditProfileForm
          profile={typedProfile}
          factions={factions}
          selectedFactionIds={selectedFactionIds}
          currentRoles={currentRoles}
          assignableRoles={assignableRoles}
          isSelf={isSelf}
        />
      </div>
    </div>
  )
}
