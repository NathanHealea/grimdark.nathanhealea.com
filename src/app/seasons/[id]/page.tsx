import { getAuthUser } from '@/lib/supabase/auth'
import { hasRole } from '@/lib/supabase/roles'
import { createClient } from '@/lib/supabase/server'
import {
  getBattlePoints,
  getBattleReportsBySeasonId,
  getDeployments,
  getMissions,
} from '@/modules/battle-report/queries'
import { getFactions, getProfileFactionIds } from '@/modules/faction/queries'
import LeaderboardTable from '@/modules/leaderboard/components/leaderboard-table'
import { computeLeaderboard } from '@/modules/leaderboard/utils'
import MarkdownRenderer from '@/modules/markdown/components/markdown-renderer'
import { getSeasonById, getSeasonRoster } from '@/modules/season/queries'
import type { Outcome } from '@/types/battle-report'
import type { Faction } from '@/types/faction'
import type { Profile } from '@/types/profile'
import { formatSeasonName, isCurrentSeason, isPastSeason } from '@/types/season'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import JoinSeasonForm from './join-season-form'
import SeasonRoster from './season-roster'

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
  return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateShort(dateString: string): string {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const seasonId = Number(id)
  if (!seasonId) return { title: 'Season' }
  const season = await getSeasonById(seasonId)
  if (!season) return { title: 'Season' }

  const title = formatSeasonName(season)
  const dateRange = `${formatDateShort(season.start_date)} – ${formatDateShort(season.end_date)}`
  const status = isCurrentSeason(season) ? 'Current season' : isPastSeason(season) ? 'Past season' : 'Upcoming season'

  const battlePoints = await getBattlePoints()
  const bp = battlePoints.find((b) => b.id === season.battle_points_id)
  const sizePart = bp ? ` ${bp.name} (${bp.size} pts).` : '.'

  const description = `${title}. ${status}, ${dateRange}.${sizePart} Grimdark League.`

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Grimdark League`,
      description,
      url: `/seasons/${id}`,
    },
  }
}

export default async function SeasonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const seasonId = Number(id)

  if (!seasonId) notFound()

  const season = await getSeasonById(seasonId)

  if (!season) notFound()

  const supabase = await createClient()

  const [auth, battleReports, { data: profiles }, factions, missions, deployments, battlePoints, roster] =
    await Promise.all([
      getAuthUser({ withProfile: true }),
      getBattleReportsBySeasonId(seasonId),
      supabase.from('profiles').select('*'),
      getFactions(),
      getMissions(),
      getDeployments(),
      getBattlePoints(),
      getSeasonRoster(seasonId),
    ])

  const profileMap = new Map(((profiles as Profile[]) ?? []).map((p) => [p.id, p]))
  const factionMap = new Map(factions.map((f) => [f.id, f]))
  const missionMap = new Map(missions.map((m) => [m.id, m]))
  const deploymentMap = new Map(deployments.map((d) => [d.id, d]))
  const battlePointsMap = new Map(battlePoints.map((bp) => [bp.id, bp]))

  const bp = battlePointsMap.get(season.battle_points_id)

  const isAdmin = auth ? await hasRole(auth.user.id, 'admin') : false

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          {/* Season Header */}
          <div className="mb-8">
            <Link href="/seasons" className="btn-back">
              &larr; All Seasons
            </Link>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-h1">{formatSeasonName(season)}</h1>
                {isCurrentSeason(season) && <span className="badge badge-success shrink-0">Current</span>}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/60">
                  <span>
                    {formatDate(season.start_date)} &ndash; {formatDate(season.end_date)}
                  </span>
                  {bp && (
                    <span>
                      {bp.name} ({bp.size} pts)
                    </span>
                  )}
                </div>
              </div>
              {isAdmin && (
                <Link href={`/admin/seasons/${id}/edit`} className="btn btn-outline btn-sm shrink-0">
                  Edit Season
                </Link>
              )}
            </div>

            {season.description && <p className="mt-3 text-base-content/70">{season.description}</p>}
          </div>

          {/* Rules */}
          {season.rules && (
            <div className="mb-8">
              <h2 className="ornament section-header">Rules</h2>
              <MarkdownRenderer content={season.rules} className="text-base-content/70" />
            </div>
          )}

          {/* Roster */}
          <div className="mb-8">
            <h2 className="ornament section-header">Roster ({roster.length})</h2>
            {auth && season.status === 'published' && await (async () => {
              const myEntry = roster.find((r) => r.profile_id === auth.profile.id)
              const profileFactionIds = await getProfileFactionIds(auth.profile.id)
              return (
                <div className="mb-4">
                  <JoinSeasonForm
                    seasonId={seasonId}
                    factions={factions}
                    profileFactionIds={profileFactionIds}
                    currentFactionId={myEntry?.faction_id}
                    isOnRoster={!!myEntry}
                  />
                </div>
              )
            })()}
            <SeasonRoster roster={roster} />
          </div>

          {/* Leaderboard */}
          <div className="mb-8">
            <h2 className="ornament section-header">Leaderboard</h2>
            <LeaderboardTable
              entries={computeLeaderboard(battleReports.filter((r) => r.status === 'published'))}
              profileMap={profileMap}
            />
          </div>

          {/* Battle Reports */}
          <div>
            <h2 className="ornament section-header">Battle Reports ({battleReports.length})</h2>

            {battleReports.length === 0 ? (
              <p className="empty-text">No battle reports for this season yet.</p>
            ) : (
              <div className="grid gap-4">
                {battleReports.map((report) => {
                  const attacker = report.attacker_id ? profileMap.get(report.attacker_id) : null
                  const defender = report.defender_id ? profileMap.get(report.defender_id) : null
                  const mission = report.mission_id ? missionMap.get(report.mission_id) : null
                  const deployment = report.deployment_id ? deploymentMap.get(report.deployment_id) : null
                  const reportBp = report.battle_points_id ? battlePointsMap.get(report.battle_points_id) : null

                  return (
                    <Link key={report.id} href={`/battle-reports/${report.id}`} className="card-interactive">
                      <div className="card-body gap-4 p-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {/* Attacker */}
                          <div className="info-row">
                            <div className="min-w-0">
                              <p className="label-meta">Attacker</p>
                              <p className="truncate font-semibold">{attacker?.display_name ?? 'Unknown'}</p>
                              <p className="truncate text-sm text-base-content/60">
                                {report.attacker_faction_id
                                  ? getFactionLabel(report.attacker_faction_id, factionMap)
                                  : 'Unknown Faction'}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xl font-bold">{report.attacker_score ?? 0}</span>
                              {report.attacker_outcome && outcomeBadge(report.attacker_outcome)}
                            </div>
                          </div>

                          {/* Defender */}
                          <div className="info-row">
                            <div className="min-w-0">
                              <p className="label-meta">Defender</p>
                              <p className="truncate font-semibold">{defender?.display_name ?? 'Unknown'}</p>
                              <p className="truncate text-sm text-base-content/60">
                                {report.defender_faction_id
                                  ? getFactionLabel(report.defender_faction_id, factionMap)
                                  : 'Unknown Faction'}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xl font-bold">{report.defender_score ?? 0}</span>
                              {report.defender_outcome && outcomeBadge(report.defender_outcome)}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/60">
                          {mission && <span>{mission.name}</span>}
                          {deployment && <span>{deployment.name}</span>}
                          {reportBp && <span>{reportBp.name}</span>}
                          {report.rounds != null && (
                            <span>
                              {report.rounds} {report.rounds === 1 ? 'round' : 'rounds'}
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
