import Avatar from '@/components/avatar'
import { getAuthUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { getFactions, getProfileFactionIds } from '@/modules/faction/queries'
import type { Faction } from '@/types/faction'
import type { Profile } from '@/types/profile'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function getFactionLabel(id: string, factionMap: Map<string, Faction>): string {
  const faction = factionMap.get(id)
  if (!faction) return id
  if (faction.parent_id) {
    const parent = factionMap.get(faction.parent_id)
    if (parent) {
      if (parent.parent_id) {
        const grandparent = factionMap.get(parent.parent_id)
        if (grandparent) return `${grandparent.name} > ${parent.name} > ${faction.name}`
      }
      return `${parent.name} > ${faction.name}`
    }
  }
  return faction.name
}

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
  const [auth, factions, factionIds] = await Promise.all([
    getAuthUser(),
    getFactions(),
    getProfileFactionIds(typedProfile.id),
  ])
  const isOwner = auth?.user.id === typedProfile.id

  const factionMap = new Map(factions.map((f) => [f.id, f]))
  const factionLabels = factionIds.map((id) => ({
    id,
    label: getFactionLabel(id, factionMap),
  }))

  const memberSince = new Date(typedProfile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex-1 flex items-center justify-center w-full px-4 py-24">
      <div className="card w-full max-w-md bg-base-200 shadow-xl">
        <div className="card-body items-center">
          <Avatar src={typedProfile.avatar_url} displayName={typedProfile.display_name} size="lg" />
          <h1 className="card-title text-2xl">{typedProfile.display_name}</h1>
          <p className="text-sm text-base-content/50">Member since {memberSince}</p>

          <div className="mt-4">
            <h2 className="text-sm font-semibold text-base-content/70">Bio</h2>
            <p className="mt-1 text-base-content">
              {typedProfile.bio ?? <span className="italic text-base-content/50">No bio yet.</span>}
            </p>
          </div>

          <div className="mt-4">
            <h2 className="text-sm font-semibold text-base-content/70">Factions</h2>
            {factionLabels.length > 0 ? (
              <ul className="mt-1 list-disc list-inside text-base-content">
                {factionLabels.map(({ id, label }) => (
                  <li key={id}>{label}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 italic text-base-content/50">No factions selected.</p>
            )}
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
