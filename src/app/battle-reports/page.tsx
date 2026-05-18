import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getFactions } from '@/modules/faction/queries'
import GuideLink from '@/modules/guides/components/guide-link'
import {
  getBattleReports,
  getAllMissions,
  getAllDeployments,
  getBattlePoints,
} from '@/modules/battle-report/queries'
import { getSeasons } from '@/modules/season/queries'
export const metadata: Metadata = {
  title: 'Battle Reports',
  description: 'Battle reports from the Grimdark League. Browse game results, scores, and outcomes from Warhammer 40k matches.',
}

import type { Outcome } from '@/types/battle-report'
import type { Profile } from '@/types/profile'
import type { Faction } from '@/types/faction'
import { formatSeasonName } from '@/types/season'
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

  const [battleReports, { data: profiles }, factions, missions, deployments, battlePoints, seasons] =
    await Promise.all([
      getBattleReports(),
      supabase.from('profiles').select('*'),
      getFactions(),
      getAllMissions(),
      getAllDeployments(),
      getBattlePoints(),
      getSeasons(),
    ])

  const profileMap = new Map((profiles as Profile[] ?? []).map((p) => [p.id, p]))
  const factionMap = new Map(factions.map((f) => [f.id, f]))
  const missionMap = new Map(missions.map((m) => [m.id, m]))
  const deploymentMap = new Map(deployments.map((d) => [d.id, d]))
  const battlePointsMap = new Map(battlePoints.map((bp) => [bp.id, bp]))
  const seasonMap = new Map(seasons.map((s) => [s.id, s]))

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-h1">Battle Reports</h1>
                <p className="mt-1 text-sm text-base-content/50">
                  Browse all submitted battle reports from the league.
                </p>
              </div>
              <GuideLink href="/guides/submitting-a-battle-report" label="How to submit" />
            </div>
          </div>

          {/* Battle Reports */}
          <div>
            <h2 className="ornament section-header">
              All Reports ({battleReports.length})
            </h2>

            {battleReports.length === 0 ? (
              <p className="empty-text">No battle reports yet.</p>
            ) : (
              <div className="grid gap-4">
                {battleReports.map((report) => {
                  const attacker = report.attacker_id ? profileMap.get(report.attacker_id) : null
                  const defender = report.defender_id ? profileMap.get(report.defender_id) : null
                  const mission = report.mission_id ? missionMap.get(report.mission_id) : null
                  const deployment = report.deployment_id ? deploymentMap.get(report.deployment_id) : null
                  const bp = report.battle_points_id ? battlePointsMap.get(report.battle_points_id) : null
                  const season = report.season_id ? seasonMap.get(report.season_id) : null

                  return (
                    <Link
                      key={report.id}
                      href={`/battle-reports/${report.id}`}
                      className="card-interactive"
                    >
                      <div className="card-body gap-4 p-4">
                        {/* Players */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {/* Attacker */}
                          <div className="info-row">
                            <div className="min-w-0">
                              <p className="label-meta">Attacker</p>
                              <p className="truncate font-semibold">{attacker?.display_name ?? 'Unknown'}</p>
                              <p className="truncate text-sm text-base-content/60">
                                {report.attacker_faction_id ? getFactionLabel(report.attacker_faction_id, factionMap) : 'Unknown Faction'}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xl font-bold">{report.attacker_score ?? 0}</span>
                              {report.attacker_outcome && outcomeBadge(report.attacker_outcome)}
                              {report.attacker_tabled && <span className="badge badge-neutral badge-sm">Tabled</span>}
                              {(report.attacker_units_lost > 0 || report.attacker_models_lost > 0) && (
                                <span className="text-xs text-base-content/50">
                                  {report.attacker_units_lost}u / {report.attacker_models_lost}m lost
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Defender */}
                          <div className="info-row">
                            <div className="min-w-0">
                              <p className="label-meta">Defender</p>
                              <p className="truncate font-semibold">{defender?.display_name ?? 'Unknown'}</p>
                              <p className="truncate text-sm text-base-content/60">
                                {report.defender_faction_id ? getFactionLabel(report.defender_faction_id, factionMap) : 'Unknown Faction'}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xl font-bold">{report.defender_score ?? 0}</span>
                              {report.defender_outcome && outcomeBadge(report.defender_outcome)}
                              {report.defender_tabled && <span className="badge badge-neutral badge-sm">Tabled</span>}
                              {(report.defender_units_lost > 0 || report.defender_models_lost > 0) && (
                                <span className="text-xs text-base-content/50">
                                  {report.defender_units_lost}u / {report.defender_models_lost}m lost
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Game details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/60">
                          {mission && <span>{mission.name}</span>}
                          {deployment && <span>{deployment.name}</span>}
                          {bp && <span>{bp.name}</span>}
                          {report.rounds != null && <span>{report.rounds} {report.rounds === 1 ? 'round' : 'rounds'}</span>}
                          {season && (
                            <span className="text-primary">
                              {formatSeasonName(season)}
                            </span>
                          )}
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
