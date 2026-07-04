import BattleReportActions from '@/app/admin/battle-reports/battle-report-actions'
import { createClient } from '@/lib/supabase/server'
import { getAllMissions, getBattlePoints, getBattleReports } from '@/modules/battle-report/queries'
import { resolvePrimaryMissions, formatPrimaryMissionPairing } from '@/modules/battle-report/utils'
import { getFactions } from '@/modules/faction/queries'
import { getEditions } from '@/modules/edition/queries'
import { getSeasons } from '@/modules/season/queries'
import type { Outcome } from '@/types/battle-report'
import type { Faction } from '@/types/faction'
import type { Profile } from '@/types/profile'
import { formatSeasonName } from '@/types/season'
import type { Metadata } from 'next'
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

  const [battleReports, { data: profiles }, factions, missions, battlePoints, seasons, editions] = await Promise.all(
    [
      getBattleReports({ includeAll: true }),
      supabase.from('profiles').select('*'),
      getFactions(),
      getAllMissions(),
      getBattlePoints(),
      getSeasons(),
      getEditions({ includeAll: true }),
    ]
  )

  const profileMap = new Map(((profiles as Profile[]) ?? []).map((p) => [p.id, p]))
  const factionMap = new Map(factions.map((f) => [f.id, f]))
  const missionMap = new Map(missions.map((m) => [m.id, m]))
  const battlePointsMap = new Map(battlePoints.map((bp) => [bp.id, bp]))
  const seasonMap = new Map(seasons.map((s) => [s.id, s]))
  const editionMap = new Map(editions.map((e) => [e.id, e]))

  const published = battleReports.filter((r) => r.status === 'published')
  const drafts = battleReports.filter((r) => r.status === 'draft')

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <div className="mb-8">
            <h1 className="text-h1">Battle Report Management</h1>
            <p className="mt-2 text-base-content/60">
              View all battle reports including drafts. {battleReports.length} total ({published.length} published,{' '}
              {drafts.length} drafts).
            </p>
          </div>

          {battleReports.length === 0 ? (
            <p className="empty-text">No battle reports yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Attacker</th>
                    <th>Defender</th>
                    <th>Edition</th>
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
                    const { attackerPrimary, defenderPrimary } = mission
                      ? { attackerPrimary: null, defenderPrimary: null }
                      : resolvePrimaryMissions(report, missions)
                    const missionLabel = mission?.name ?? formatPrimaryMissionPairing(attackerPrimary, defenderPrimary)
                    const bp = report.battle_points_id ? battlePointsMap.get(report.battle_points_id) : null
                    const season = report.season_id ? seasonMap.get(report.season_id) : null
                    const edition = editionMap.get(report.edition_id)
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
                          {report.event_date ? (
                            formatDate(report.event_date)
                          ) : (
                            <span className="text-base-content/40">&mdash;</span>
                          )}
                        </td>
                        <td>
                          {attacker ? (
                            <div>
                              <p className="text-sm font-semibold">{attacker.display_name}</p>
                              {report.attacker_faction_id && (
                                <p className="text-xs text-base-content/60">
                                  {getFactionLabel(report.attacker_faction_id, factionMap)}
                                </p>
                              )}
                              {report.attacker_outcome && (
                                <div className="mt-1 flex items-center gap-1">
                                  {outcomeBadge(report.attacker_outcome)}
                                  {report.attacker_score != null && (
                                    <span className="text-xs font-bold">{report.attacker_score}</span>
                                  )}
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
                                <p className="text-xs text-base-content/60">
                                  {getFactionLabel(report.defender_faction_id, factionMap)}
                                </p>
                              )}
                              {report.defender_outcome && (
                                <div className="mt-1 flex items-center gap-1">
                                  {outcomeBadge(report.defender_outcome)}
                                  {report.defender_score != null && (
                                    <span className="text-xs font-bold">{report.defender_score}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-base-content/40">&mdash;</span>
                          )}
                        </td>
                        <td className="text-sm">
                          {edition ? (
                            <span className="badge badge-outline badge-sm">{edition.short_name}</span>
                          ) : (
                            <span className="text-base-content/40">&mdash;</span>
                          )}
                        </td>
                        <td className="text-sm">
                          {missionLabel ? (
                            <div>
                              <p>{missionLabel}</p>
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
                          <BattleReportActions
                            reportId={report.id}
                            reportLabel={
                              attacker && defender
                                ? `${attacker.display_name} vs ${defender.display_name}`
                                : report.event_date
                                  ? formatDate(report.event_date)
                                  : report.id
                            }
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
