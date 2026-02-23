import type { Metadata } from 'next'
import Avatar from '@/components/avatar'
import { getAuthUser } from '@/lib/supabase/auth'
import { hasRole } from '@/lib/supabase/roles'
import { createClient } from '@/lib/supabase/server'
import { getFactions, getProfileFactionIds } from '@/modules/faction/queries'
import {
  getBattleReportsByPlayerId,
  getMissions,
  getDeployments,
  getBattlePoints,
} from '@/modules/battle-report/queries'
import type { Outcome } from '@/types/battle-report'
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

function outcomeBadge(outcome: Outcome) {
  const styles: Record<Outcome, string> = {
    win: 'badge badge-success',
    loss: 'badge badge-error',
    draw: 'badge badge-warning',
  }
  return <span className={styles[outcome]}>{outcome.charAt(0).toUpperCase() + outcome.slice(1)}</span>
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export async function generateMetadata({ params }: { params: Promise<{ profileId: string }> }): Promise<Metadata> {
  const { profileId } = await params
  const id = Number(profileId)
  if (Number.isNaN(id)) return { title: 'Profile' }
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('display_name').eq('profile_id', id).single()
  return { title: profile?.display_name ?? 'Profile' }
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
  const [auth, factions, factionIds, battleReports, { data: profiles }, missions, deployments, battlePoints] =
    await Promise.all([
      getAuthUser(),
      getFactions(),
      getProfileFactionIds(typedProfile.id),
      getBattleReportsByPlayerId(typedProfile.id),
      supabase.from('profiles').select('*'),
      getMissions(),
      getDeployments(),
      getBattlePoints(),
    ])
  const isOwner = auth?.user.id === typedProfile.user_id
  const isAdmin = auth ? await hasRole(auth.user.id, 'admin') : false

  const factionMap = new Map(factions.map((f) => [f.id, f]))
  const factionLabels = factionIds.map((id) => ({
    id,
    label: getFactionLabel(id, factionMap),
  }))

  const profileMap = new Map((profiles as Profile[] ?? []).map((p) => [p.id, p]))
  const missionMap = new Map(missions.map((m) => [m.id, m]))
  const deploymentMap = new Map(deployments.map((d) => [d.id, d]))
  const battlePointsMap = new Map(battlePoints.map((bp) => [bp.id, bp]))

  const memberSince = new Date(typedProfile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="flex flex-col items-center -mt-72 pt-72 min-h-screen w-full">
      <div className="w-full px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/members" className="btn btn-ghost btn-sm mb-4 -ml-2">
              &larr; All Members
            </Link>
            <div className="flex items-start gap-4">
              <Avatar src={typedProfile.avatar_url} displayName={typedProfile.display_name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h1 className="text-3xl font-bold">{typedProfile.display_name}</h1>
                  {(isOwner || isAdmin) && (
                    <div className="flex gap-2 shrink-0">
                      {isOwner && (
                        <Link href="/profile/edit" className="btn btn-outline btn-sm">
                          Edit Profile
                        </Link>
                      )}
                      {isAdmin && !isOwner && (
                        <Link href={`/admin/user-management/${typedProfile.profile_id}/edit`} className="btn btn-outline btn-sm">
                          Edit User
                        </Link>
                      )}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-sm text-base-content/50">Member since {memberSince}</p>
                {typedProfile.bio && <p className="mt-3 text-base-content/70">{typedProfile.bio}</p>}
                {!typedProfile.bio && <p className="mt-3 italic text-base-content/50">No bio yet.</p>}
              </div>
            </div>
          </div>

          {/* Factions */}
          <div className="mb-8">
            <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">Factions</h2>
            {factionLabels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {factionLabels.map(({ id, label }) => (
                  <span key={id} className="badge badge-lg bg-base-200">{label}</span>
                ))}
              </div>
            ) : (
              <p className="text-base-content/50 italic">No factions selected.</p>
            )}
          </div>

          {/* Battle Reports */}
          <div>
            <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">
              Battle Reports ({battleReports.length})
            </h2>

            {battleReports.length === 0 ? (
              <p className="text-base-content/50 italic">No battle reports yet.</p>
            ) : (
              <div className="grid gap-4">
                {battleReports.map((report) => {
                  const attacker = profileMap.get(report.attacker_id)
                  const defender = profileMap.get(report.defender_id)
                  const mission = missionMap.get(report.mission_id)
                  const deployment = deploymentMap.get(report.deployment_id)
                  const bp = battlePointsMap.get(report.battle_points_id)

                  return (
                    <Link
                      key={report.id}
                      href={`/battle-reports/${report.id}`}
                      className="card bg-base-200 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="card-body gap-4 p-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {/* Attacker */}
                          <div className="flex items-center justify-between gap-2 rounded-lg bg-base-300 p-3">
                            <div className="min-w-0">
                              <p className="text-xs font-medium uppercase text-base-content/50">Attacker</p>
                              <p className="truncate font-semibold">{attacker?.display_name ?? 'Unknown'}</p>
                              <p className="truncate text-sm text-base-content/60">
                                {getFactionLabel(report.attacker_faction_id, factionMap)}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xl font-bold">{report.attacker_score}</span>
                              {outcomeBadge(report.attacker_outcome)}
                            </div>
                          </div>

                          {/* Defender */}
                          <div className="flex items-center justify-between gap-2 rounded-lg bg-base-300 p-3">
                            <div className="min-w-0">
                              <p className="text-xs font-medium uppercase text-base-content/50">Defender</p>
                              <p className="truncate font-semibold">{defender?.display_name ?? 'Unknown'}</p>
                              <p className="truncate text-sm text-base-content/60">
                                {getFactionLabel(report.defender_faction_id, factionMap)}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xl font-bold">{defender?.display_name ? report.defender_score : 0}</span>
                              {outcomeBadge(report.defender_outcome)}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/60">
                          {mission && <span>{mission.name}</span>}
                          {deployment && <span>{deployment.name}</span>}
                          {bp && <span>{bp.name}</span>}
                          <span>{report.rounds} {report.rounds === 1 ? 'round' : 'rounds'}</span>
                          <span className="ml-auto">{formatDate(report.event_date)}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
