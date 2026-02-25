import type { Metadata } from 'next'
import { getSeasons } from '@/modules/season/queries'
export const metadata: Metadata = { title: 'Seasons' }

import { getBattlePoints, getBattleReportCountsBySeasonId } from '@/modules/battle-report/queries'
import type { BattlePoints } from '@/types/battle-report'
import { formatSeasonName, type Season } from '@/types/season'
import Link from 'next/link'

function formatDate(dateString: string): string {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function SeasonCard({ season, battlePointsMap, reportCount, highlighted }: {
  season: Season
  battlePointsMap: Map<number, BattlePoints>
  reportCount: number
  highlighted?: boolean
}) {
  const bp = battlePointsMap.get(season.battle_points_id)

  return (
    <Link
      href={`/seasons/${season.id}`}
      className={`card ${highlighted ? 'bg-base-200 border-2 border-primary/30' : 'bg-base-200'} shadow-sm transition-shadow hover:shadow-md`}
    >
      <div className="card-body gap-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className={`card-title ${highlighted ? 'text-gold' : ''}`}>{formatSeasonName(season)}</h2>
          {season.is_active && <span className="badge badge-success shrink-0">Active</span>}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/60">
          <span>{formatDate(season.start_date)} &ndash; {formatDate(season.end_date)}</span>
          {bp && <span>{bp.name} ({bp.size} pts)</span>}
          <span>{reportCount} {reportCount === 1 ? 'battle report' : 'battle reports'}</span>
        </div>

        {season.description && <p className="text-base-content/70">{season.description}</p>}
      </div>
    </Link>
  )
}

export default async function SeasonsPage() {
  const [seasons, battlePoints, reportCounts] = await Promise.all([
    getSeasons(),
    getBattlePoints(),
    getBattleReportCountsBySeasonId(),
  ])

  const battlePointsMap = new Map<number, BattlePoints>(battlePoints.map((bp) => [bp.id, bp]))

  const activeSeason = seasons.find((s) => s.is_active)
  const pastSeasons = seasons.filter((s) => !s.is_active)

  return (
    <main className="flex flex-col items-center -mt-72 pt-72 min-h-screen w-full">
      <div className="w-full px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Seasons</h1>
            <p className="mt-2 text-base-content/60">
              League play is organized into seasons with set battle sizes and date ranges.
            </p>
          </div>

          {/* Active Season */}
          {activeSeason && (
            <div className="mb-8">
              <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">Current Season</h2>
              <SeasonCard season={activeSeason} battlePointsMap={battlePointsMap} reportCount={reportCounts.get(activeSeason.id) ?? 0} highlighted />
            </div>
          )}

          {/* Past Seasons */}
          {pastSeasons.length > 0 && (
            <div>
              <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">Past Seasons</h2>
              <div className="grid gap-4">
                {pastSeasons.map((season) => (
                  <SeasonCard key={season.id} season={season} battlePointsMap={battlePointsMap} reportCount={reportCounts.get(season.id) ?? 0} />
                ))}
              </div>
            </div>
          )}

          {seasons.length === 0 && (
            <p className="text-base-content/50 italic">No seasons yet. Check back soon!</p>
          )}
        </div>
      </div>
    </main>
  )
}
