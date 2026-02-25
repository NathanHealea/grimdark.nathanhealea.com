import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getFactions } from '@/modules/faction/queries'
import {
  getBattleReports,
  getMissions,
  getDeployments,
  getBattlePoints,
} from '@/modules/battle-report/queries'
import { getSeasons } from '@/modules/season/queries'
import ActionsMenu from '@/components/actions-menu'
import type { Outcome } from '@/types/battle-report'
import type { Profile } from '@/types/profile'
import type { Faction } from '@/types/faction'
import { formatSeasonName } from '@/types/season'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Battle Report Management' }

function outcomeBadge(outcome: Outcome) {
  const styles: Record<Outcome, string> = {
    win: 'badge badge-success badge-sm',
    loss: 'badge badge-error badge-sm',
    draw: 'badge badge-warning badge-sm',
  }
  return <span className={styles[outcome]}>{outcome.charAt(0).toUpperCase() + outcome.slice(1)}</span>
}

function getFactionLabel(id: string, factionMap: Map<string, Faction>): string {
  const faction = factionMap.get(id)
  if (!faction) return 'Unknown'
  if (faction.parent_id) {
    const parent = factionMap.get(faction.parent_id)
    if (parent) return `${parent.name} > ${faction.name}`
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

export default async function AdminBattleReportsPage() {
  const supabase = await createClient()

  const [battleReports, { data: profiles }, factions, missions, deployments, battlePoints, seasons] =
    await Promise.all([
      getBattleReports({ includeAll: true }),
      supabase.from('profiles').select('*'),
      getFactions(),
      getMissions(),
      getDeployments(),
      getBattlePoints(),
      getSeasons(),
    ])

  const profileMap = new Map((profiles as Profile[] ?? []).map((p) => [p.id, p]))
  const factionMap = new Map(factions.map((f) => [f.id, f]))
  const missionMap = new Map(missions.map((m) => [m.id, m]))
  const battlePointsMap = new Map(battlePoints.map((bp) => [bp.id, bp]))
  const seasonMap = new Map(seasons.map((s) => [s.id, s]))

  const published = battleReports.filter((r) => r.status === 'published')
  const drafts = battleReports.filter((r) => r.status === 'draft')

  return (
    <main className="flex flex-col items-center -mt-72 pt-72 min-h-screen w-full">
      <div className="w-full px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Battle Report Management</h1>
            <p className="mt-2 text-base-content/60">
              View all battle reports including drafts. {battleReports.length} total ({published.length} published, {drafts.length} drafts).
            </p>
          </div>

          {battleReports.length === 0 ? (
            <p className="text-base-content/50 italic">No battle reports yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Attacker</th>
                    <th>Defender</th>
                    <th>Mission</th>
                    <th>Season</th>
                    <th>Reported By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {battleReports.map((report) => {
                    const attacker = report.attacker_id ? profileMap.get(report.attacker_id) : null
                    const defender = report.defender_id ? profileMap.get(report.defender_id) : null
                    const mission = report.mission_id ? missionMap.get(report.mission_id) : null
                    const bp = report.battle_points_id ? battlePointsMap.get(report.battle_points_id) : null
                    const season = report.season_id ? seasonMap.get(report.season_id) : null
                    const reportedBy = profileMap.get(report.reported_by)

                    return (
                      <tr key={report.id} className="hover">
                        <td>
                          {report.status === 'draft' ? (
                            <span className="badge badge-warning badge-sm">Draft</span>
                          ) : (
                            <span className="badge badge-success badge-sm">Published</span>
                          )}
                        </td>
                        <td className="text-sm">
                          {report.event_date ? formatDate(report.event_date) : <span className="text-base-content/40">&mdash;</span>}
                        </td>
                        <td>
                          {attacker ? (
                            <div>
                              <p className="text-sm font-semibold">{attacker.display_name}</p>
                              {report.attacker_faction_id && (
                                <p className="text-xs text-base-content/60">{getFactionLabel(report.attacker_faction_id, factionMap)}</p>
                              )}
                              {report.attacker_outcome && (
                                <div className="mt-1 flex items-center gap-1">
                                  {outcomeBadge(report.attacker_outcome)}
                                  {report.attacker_score != null && <span className="text-xs font-bold">{report.attacker_score}</span>}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-base-content/40">&mdash;</span>
                          )}
                        </td>
                        <td>
                          {defender ? (
                            <div>
                              <p className="text-sm font-semibold">{defender.display_name}</p>
                              {report.defender_faction_id && (
                                <p className="text-xs text-base-content/60">{getFactionLabel(report.defender_faction_id, factionMap)}</p>
                              )}
                              {report.defender_outcome && (
                                <div className="mt-1 flex items-center gap-1">
                                  {outcomeBadge(report.defender_outcome)}
                                  {report.defender_score != null && <span className="text-xs font-bold">{report.defender_score}</span>}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-base-content/40">&mdash;</span>
                          )}
                        </td>
                        <td className="text-sm">
                          {mission ? (
                            <div>
                              <p>{mission.name}</p>
                              {bp && <p className="text-xs text-base-content/60">{bp.name}</p>}
                            </div>
                          ) : (
                            <span className="text-base-content/40">&mdash;</span>
                          )}
                        </td>
                        <td className="text-sm">
                          {season ? (
                            <Link href={`/seasons/${season.id}`} className="link link-hover link-primary">
                              {formatSeasonName(season)}
                            </Link>
                          ) : (
                            <span className="text-base-content/40">&mdash;</span>
                          )}
                        </td>
                        <td className="text-sm">{reportedBy?.display_name ?? 'Unknown'}</td>
                        <td>
                          <ActionsMenu
                            items={[
                              { label: 'View Report', href: `/battle-reports/${report.id}` },
                              { label: 'Edit Report', href: `/battle-reports/${report.id}/edit` },
                            ]}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
