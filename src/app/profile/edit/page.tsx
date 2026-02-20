import { getAuthUser } from '@/lib/supabase/auth'
import { getFactions, getProfileFactionIds } from '@/modules/faction/queries'
import { redirect } from 'next/navigation'
import EditProfileForm from './edit-profile-form'

export default async function EditProfilePage() {
  const auth = await getAuthUser({ withProfile: true })

  if (!auth) {
    redirect('/sign-in')
  }

  const [factions, selectedFactionIds] = await Promise.all([getFactions(), getProfileFactionIds(auth.user.id)])

  return (
    <main className="flex flex-col items-center justify-center -mt-72 pt-72 min-h-screen w-full">
    <div className="flex-1 flex items-center justify-center w-full px-4 py-24">
      <EditProfileForm profile={auth.profile} userId={auth.user.id} factions={factions} selectedFactionIds={selectedFactionIds} />
    </div>
    </main>
  )
}
