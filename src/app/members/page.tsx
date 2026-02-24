import Avatar from '@/components/avatar'
import type { Metadata } from 'next'
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

  const [{ data: profiles }, factions, { data: profileFactions }, { data: battleParticipants }] = await Promise.all([
    supabase.from('profiles').select('*').in('role', ['member', 'organizer']).order('display_name'),
    getFactions(),
    supabase.from('profile_factions').select('profile_id, faction_id'),
    supabase.from('battle_reports').select('attacker_id, defender_id, season_id').eq('status', 'published'),
  ])

  const battleCountByProfile = new Map<string, number>()
  const seasonsByProfile = new Map<string, Set<number>>()
  for (const bp of battleParticipants ?? []) {
    for (const id of [bp.attacker_id, bp.defender_id]) {
      if (!id) continue
      battleCountByProfile.set(id, (battleCountByProfile.get(id) ?? 0) + 1)
      if (bp.season_id) {
        const set = seasonsByProfile.get(id) ?? new Set()
        set.add(bp.season_id)
        seasonsByProfile.set(id, set)
      }
    }
  }

  const factionMap = new Map(factions.map((f) => [f.id, f]))

  const factionsByProfile = new Map<string, { id: string; label: string }[]>()
  for (const pf of profileFactions ?? []) {
    const list = factionsByProfile.get(pf.profile_id) ?? []
    list.push({ id: pf.faction_id, label: getFactionLabel(pf.faction_id, factionMap) })
    factionsByProfile.set(pf.profile_id, list)
  }

  const members = ((profiles as Profile[]) ?? []).map((profile) => ({
    ...profile,
    factions: (factionsByProfile.get(profile.id) ?? []).sort((a, b) => a.label.localeCompare(b.label)),
    battleCount: battleCountByProfile.get(profile.id) ?? 0,
    seasonCount: seasonsByProfile.get(profile.id)?.size ?? 0,
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
                <Link
                  key={member.id}
                  href={`/profile/${member.profile_id}`}
                  className="card bg-base-200 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="card-body flex-col items-center gap-4 p-4">
                    <div className="min-h-24 flex items-center justify-center">
                      <Avatar src={member.avatar_url} displayName={member.display_name} size="lg" />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col items-center text-center gap-2">
                      <h2 className="font-semibold text-2xl truncate text-center">{member.display_name}</h2>
                      <h3 className='text-lg'>{member.role}</h3>
                      <div className="mt-1 flex gap-3 text-xs text-base-content/50 text-primary">
                        <span>
                          {member.battleCount} {member.battleCount === 1 ? 'battle' : 'battles'}
                        </span>
                        <span>
                          {member.seasonCount} {member.seasonCount === 1 ? 'season' : 'seasons'}
                        </span>
                      </div>
                      {member.factions.length > 0 && (
                        <div className="mt-1 flex flex-col items-center gap-1">
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
