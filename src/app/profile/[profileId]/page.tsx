import { getAuthUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/profile'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ProfilePage({ params }: { params: Promise<{ profileId: string }> }) {
  const { profileId } = await params
  const id = Number(profileId)

  if (Number.isNaN(id)) {
    notFound()
  }

  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('*').eq('profile_id', id).single()

  if (!profile) {
    notFound()
  }

  const typedProfile = profile as Profile
  const auth = await getAuthUser()
  const isOwner = auth?.user.id === typedProfile.id

  const memberSince = new Date(typedProfile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="card w-full max-w-md bg-base-200 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">{typedProfile.display_name}</h1>
          <p className="text-sm text-base-content/50">Member since {memberSince}</p>

          <div className="mt-4">
            <h2 className="text-sm font-semibold text-base-content/70">Bio</h2>
            <p className="mt-1 text-base-content">
              {typedProfile.bio ?? <span className="italic text-base-content/50">No bio yet.</span>}
            </p>
          </div>

          {isOwner && (
            <div className="card-actions mt-4 justify-end">
              <Link href="/profile/edit" className="btn btn-outline btn-sm">
                Edit Profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
