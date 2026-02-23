import type { Metadata } from 'next'
import Avatar from '@/components/avatar'
export const metadata: Metadata = { title: 'Members' }

import { createClient } from '@/lib/supabase/server'
import { getFactions } from '@/modules/faction/queries'
import type { Faction } from '@/types/faction'
import type { Profile } from '@/types/profile'
import Link from 'next/link'

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

export default async function MembersPage() {
  const supabase = await createClient()

  const [{ data: profiles }, factions, { data: profileFactions }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .in('role', ['member', 'organizer'])
      .order('display_name'),
    getFactions(),
    supabase.from('profile_factions').select('profile_id, faction_id'),
  ])

  const factionMap = new Map(factions.map((f) => [f.id, f]))

  const factionsByProfile = new Map<string, { id: string; label: string }[]>()
  for (const pf of profileFactions ?? []) {
    const list = factionsByProfile.get(pf.profile_id) ?? []
    list.push({ id: pf.faction_id, label: getFactionLabel(pf.faction_id, factionMap) })
    factionsByProfile.set(pf.profile_id, list)
  }

  const members = ((profiles as Profile[]) ?? []).map((profile) => ({
    ...profile,
    factions: factionsByProfile.get(profile.id) ?? [],
  }))

  return (
    <main className="flex flex-col items-center -mt-72 pt-72 min-h-screen w-full">
    <div className="w-full px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="mt-2 text-base-content/60">Browse all league participants and discover their factions.</p>
        </div>

        {members.length === 0 ? (
          <p className="text-base-content/50 italic">No members yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <Link key={member.id} href={`/profile/${member.profile_id}`} className="card bg-base-200 shadow-sm transition-shadow hover:shadow-md">
                <div className="card-body flex-row items-center gap-4 p-4">
                  <Avatar src={member.avatar_url} displayName={member.display_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold truncate">{member.display_name}</h2>
                    {member.factions.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {member.factions.map(({ id, label }) => (
                          <span key={id} className="badge badge-sm badge-outline">
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
    </main>
  )
}
