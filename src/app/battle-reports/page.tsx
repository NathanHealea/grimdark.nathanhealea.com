import type { Metadata } from 'next'
import { getAuthUser } from '@/lib/supabase/auth'
import { hasRole } from '@/lib/supabase/roles'
import { createClient } from '@/lib/supabase/server'
import { getFactions } from '@/modules/faction/queries'
import {
  getBattleReports,
  getMissions,
  getDeployments,
  getBattlePoints,
} from '@/modules/battle-report/queries'
export const metadata: Metadata = { title: 'Battle Reports' }

import type { Outcome } from '@/types/battle-report'
import type { Profile } from '@/types/profile'
import type { Faction } from '@/types/faction'
import Link from 'next/link'

function outcomeBadge(outcome: Outcome) {
  const styles: Record<Outcome, string> = {
    win: 'badge badge-success',
    loss: 'badge badge-error',
    draw: 'badge badge-warning',
  }
  return <span className={styles[outcome]}>{outcome.charAt(0).toUpperCase() + outcome.slice(1)}</span>
}

function getFactionLabel(id: string, factionMap: Map<string, Faction>): string {
  const faction = factionMap.get(id)
  if (!faction) return 'Unknown Faction'
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function BattleReportsPage() {
  const supabase = await createClient()
  const auth = await getAuthUser()
  const isAdmin = auth ? await hasRole(auth.user.id, 'admin') : false

  const [battleReports, { data: profiles }, factions, missions, deployments, battlePoints] =
    await Promise.all([
      getBattleReports({ includeAll: isAdmin }),
      supabase.from('profiles').select('*'),
      getFactions(),
      getMissions(),
      getDeployments(),
      getBattlePoints(),
    ])

  const profileMap = new Map((profiles as Profile[] ?? []).map((p) => [p.id, p]))
  const factionMap = new Map(factions.map((f) => [f.id, f]))
  const missionMap = new Map(missions.map((m) => [m.id, m]))
  const deploymentMap = new Map(deployments.map((d) => [d.id, d]))
  const battlePointsMap = new Map(battlePoints.map((bp) => [bp.id, bp]))

  return (
    <main className="flex flex-col items-center -mt-72 pt-72 min-h-screen w-full">
      <div className="w-full px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Battle Reports</h1>
            <p className="mt-1 text-sm text-base-content/50">
              Browse all submitted battle reports from the league.
            </p>
          </div>

          {/* Battle Reports */}
          <div>
            <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">
              All Reports ({battleReports.length})
            </h2>

            {battleReports.length === 0 ? (
              <p className="text-base-content/50 italic">No battle reports yet.</p>
            ) : (
              <div className="grid gap-4">
                {battleReports.map((report) => {
                  const attacker = report.attacker_id ? profileMap.get(report.attacker_id) : null
                  const defender = report.defender_id ? profileMap.get(report.defender_id) : null
                  const mission = report.mission_id ? missionMap.get(report.mission_id) : null
                  const deployment = report.deployment_id ? deploymentMap.get(report.deployment_id) : null
                  const bp = report.battle_points_id ? battlePointsMap.get(report.battle_points_id) : null

                  return (
                    <Link
                      key={report.id}
                      href={`/battle-reports/${report.id}`}
                      className="card bg-base-200 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="card-body gap-4 p-4">
                        {report.status === 'draft' && (
                          <span className="badge badge-warning badge-sm self-start">Draft</span>
                        )}
                        {/* Players */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {/* Attacker */}
                          <div className="flex items-center justify-between gap-2 rounded-lg bg-base-300 p-3">
                            <div className="min-w-0">
                              <p className="text-xs font-medium uppercase text-base-content/50">Attacker</p>
                              <p className="truncate font-semibold">{attacker?.display_name ?? 'Unknown'}</p>
                              <p className="truncate text-sm text-base-content/60">
                                {report.attacker_faction_id ? getFactionLabel(report.attacker_faction_id, factionMap) : 'Unknown Faction'}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xl font-bold">{report.attacker_score ?? 0}</span>
                              {report.attacker_outcome && outcomeBadge(report.attacker_outcome)}
                            </div>
                          </div>

                          {/* Defender */}
                          <div className="flex items-center justify-between gap-2 rounded-lg bg-base-300 p-3">
                            <div className="min-w-0">
                              <p className="text-xs font-medium uppercase text-base-content/50">Defender</p>
                              <p className="truncate font-semibold">{defender?.display_name ?? 'Unknown'}</p>
                              <p className="truncate text-sm text-base-content/60">
                                {report.defender_faction_id ? getFactionLabel(report.defender_faction_id, factionMap) : 'Unknown Faction'}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xl font-bold">{report.defender_score ?? 0}</span>
                              {report.defender_outcome && outcomeBadge(report.defender_outcome)}
                            </div>
                          </div>
                        </div>

                        {/* Game details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/60">
                          {mission && <span>{mission.name}</span>}
                          {deployment && <span>{deployment.name}</span>}
                          {bp && <span>{bp.name}</span>}
                          {report.rounds != null && <span>{report.rounds} {report.rounds === 1 ? 'round' : 'rounds'}</span>}
                          {report.event_date && <span className="ml-auto">{formatDate(report.event_date)}</span>}
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
