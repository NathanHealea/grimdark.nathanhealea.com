import Avatar from '@/components/avatar'
import { getAuthUser } from '@/lib/supabase/auth'
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
  const isOwner = auth?.user.id === typedProfile.id

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
    <main className="flex flex-col items-center justify-center -mt-16 min-h-screen">
    <div className="flex-1 flex items-center justify-center w-full px-4 py-24">
      <div className="card w-full max-w-2xl bg-base-200 shadow-xl">
        <div className="card-body gap-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar src={typedProfile.avatar_url} displayName={typedProfile.display_name} size="lg" />
            <h1 className="card-title text-2xl">{typedProfile.display_name}</h1>
            <p className="text-sm text-base-content/50">Member since {memberSince}</p>
          </div>

          <div className="">
            <h2 className="text-sm font-semibold text-base-content/70">Bio</h2>
            <p className="mt-1 text-base-content">
              {typedProfile.bio ?? <span className="italic text-base-content/50">No bio yet.</span>}
            </p>
          </div>

          <div className="">
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

          <div className="">
            <h2 className="text-sm font-semibold text-base-content/70">Battle Reports</h2>
            {battleReports.length === 0 ? (
              <p className="mt-1 italic text-base-content/50">No battle reports yet.</p>
            ) : (
              <div className="mt-2 grid gap-4">
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
                      className="card bg-base-300 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="card-body gap-4 p-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {/* Attacker */}
                          <div className="flex items-center justify-between gap-2 rounded-lg bg-base-100 p-3">
                            <div className="min-w-0">
                              <p className="text-xs font-medium uppercase text-base-content/50">
                                Attacker
                              </p>
                              <p className="truncate font-semibold">
                                {attacker?.display_name ?? 'Unknown'}
                              </p>
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
                          <div className="flex items-center justify-between gap-2 rounded-lg bg-base-100 p-3">
                            <div className="min-w-0">
                              <p className="text-xs font-medium uppercase text-base-content/50">
                                Defender
                              </p>
                              <p className="truncate font-semibold">
                                {defender?.display_name ?? 'Unknown'}
                              </p>
                              <p className="truncate text-sm text-base-content/60">
                                {getFactionLabel(report.defender_faction_id, factionMap)}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xl font-bold">{report.defender_score}</span>
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
    </main>
  )
}
