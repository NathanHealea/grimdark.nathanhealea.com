import { getAuthUser } from '@/lib/supabase/auth'
import { getFactions, getProfileFactionIds } from '@/modules/faction/queries'
import { redirect } from 'next/navigation'
import EditProfileForm from './edit-profile-form'

export default async function EditProfilePage() {
  const auth = await getAuthUser({ withProfile: true })

  if (!auth) {
    redirect('/sign-in')
  }

  const [factions, selectedFactionIds] = await Promise.all([
    getFactions(),
    getProfileFactionIds(auth.user.id),
  ])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <EditProfileForm
        profile={auth.profile}
        factions={factions}
        selectedFactionIds={selectedFactionIds}
      />
    </div>
  )
}
