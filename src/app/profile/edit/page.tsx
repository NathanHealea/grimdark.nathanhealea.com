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

  const hasEmailAuth = auth.user.identities?.some((i) => i.provider === 'email') ?? false

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <div className="mb-8">
            <Link href={`/profile/${auth.profile.profile_id}`} className="btn-back">
              &larr; View Profile
            </Link>
            <h1 className="text-h1">Edit Profile</h1>
            <p className="mt-1 text-sm text-base-content/50">Update your profile information and factions.</p>
          </div>

          <EditProfileForm
            profile={auth.profile}
            factions={factions}
            selectedFactionIds={selectedFactionIds}
            hasEmailAuth={hasEmailAuth}
          />
        </div>
      </div>
    </main>
  )
}
