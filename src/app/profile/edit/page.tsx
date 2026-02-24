import { getAuthUser } from '@/lib/supabase/auth'
import { getFactions, getProfileFactionIds } from '@/modules/faction/queries'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import EditProfileForm from './edit-profile-form'

export default async function EditProfilePage() {
  const auth = await getAuthUser({ withProfile: true })

  if (!auth) {
    redirect('/sign-in')
  }

  const [factions, selectedFactionIds] = await Promise.all([getFactions(), getProfileFactionIds(auth.profile.id)])

  return (
    <main className="flex flex-col items-center -mt-72 pt-72 min-h-screen w-full">
      <div className="w-full px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <Link href={`/profile/${auth.profile.profile_id}`} className="btn btn-ghost btn-sm mb-4 -ml-2">
              &larr; View Profile
            </Link>
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="mt-1 text-sm text-base-content/50">Update your profile information and factions.</p>
          </div>

          <EditProfileForm profile={auth.profile} factions={factions} selectedFactionIds={selectedFactionIds} />
        </div>
      </div>
    </main>
  )
}
