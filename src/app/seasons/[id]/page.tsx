import { createClient } from '@/lib/supabase/server'
import { getSeasonById } from '@/modules/season/queries'
import { getFactions } from '@/modules/faction/queries'
import {
  getBattleReportsBySeasonId,
  getMissions,
  getDeployments,
  getBattlePoints,
} from '@/modules/battle-report/queries'
import type { Outcome } from '@/types/battle-report'
import type { Profile } from '@/types/profile'
import type { Faction } from '@/types/faction'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TrophyIcon } from '@heroicons/react/24/outline'

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

export default async function SeasonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const seasonId = Number(id)

  if (!seasonId) notFound()

  const season = await getSeasonById(seasonId)

  if (!season) notFound()

  const supabase = await createClient()

  const [battleReports, { data: profiles }, factions, missions, deployments, battlePoints] = await Promise.all([
    getBattleReportsBySeasonId(seasonId),
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

  const bp = battlePointsMap.get(season.battle_points_id)

  return (
    <main className="flex flex-col items-center -mt-72 pt-72 min-h-screen w-full">
      <div className="w-full px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Season Header */}
          <div className="mb-8">
            <Link href="/seasons" className="btn btn-ghost btn-sm mb-4 -ml-2">
              &larr; All Seasons
            </Link>
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-3xl font-bold">{season.name}</h1>
              {season.is_active && <span className="badge badge-success shrink-0">Active</span>}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/60">
              <span>{formatDate(season.start_date)} &ndash; {formatDate(season.end_date)}</span>
              {bp && <span>{bp.name} ({bp.size} pts)</span>}
            </div>
            {season.description && <p className="mt-3 text-base-content/70">{season.description}</p>}
          </div>

          {/* Leaderboard Placeholder */}
          <div className="mb-8">
            <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">Leaderboard</h2>
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body items-center py-12 text-center">
                <TrophyIcon className="size-12 text-base-content/20" />
                <p className="mt-2 text-base-content/50">Leaderboard coming soon.</p>
              </div>
            </div>
          </div>

          {/* Battle Reports */}
          <div>
            <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">
              Battle Reports ({battleReports.length})
            </h2>

            {battleReports.length === 0 ? (
              <p className="text-base-content/50 italic">No battle reports for this season yet.</p>
            ) : (
              <div className="grid gap-4">
                {battleReports.map((report) => {
                  const attacker = profileMap.get(report.attacker_id)
                  const defender = profileMap.get(report.defender_id)
                  const mission = missionMap.get(report.mission_id)
                  const deployment = deploymentMap.get(report.deployment_id)
                  const reportBp = battlePointsMap.get(report.battle_points_id)

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
                              <span className="text-xl font-bold">{report.defender_score}</span>
                              {outcomeBadge(report.defender_outcome)}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/60">
                          {mission && <span>{mission.name}</span>}
                          {deployment && <span>{deployment.name}</span>}
                          {reportBp && <span>{reportBp.name}</span>}
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
