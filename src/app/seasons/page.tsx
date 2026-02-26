import type { Metadata } from 'next'
import { getSeasons } from '@/modules/season/queries'
export const metadata: Metadata = { title: 'Seasons' }

import { getBattlePoints, getBattleReportCountsBySeasonId } from '@/modules/battle-report/queries'
import type { BattlePoints } from '@/types/battle-report'
import { formatSeasonName, isCurrentSeason, isFutureSeason, isPastSeason, type Season } from '@/types/season'
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
          {isCurrentSeason(season) && <span className="badge badge-success shrink-0">Current</span>}
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

  const currentSeason = seasons.find((s) => isCurrentSeason(s))
  const futureSeasons = seasons.filter((s) => isFutureSeason(s))
  const pastSeasons = seasons.filter((s) => isPastSeason(s))

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <div className="mb-8">
            <h1 className="text-h1">Seasons</h1>
            <p className="mt-2 text-base-content/60">
              League play is organized into seasons with set battle sizes and date ranges.
            </p>
          </div>

          {/* Current Season */}
          {currentSeason && (
            <div className="mb-8">
              <h2 className="ornament section-header">Current Season</h2>
              <SeasonCard season={currentSeason} battlePointsMap={battlePointsMap} reportCount={reportCounts.get(currentSeason.id) ?? 0} highlighted />
            </div>
          )}

          {/* Future Seasons */}
          {futureSeasons.length > 0 && (
            <div className="mb-8">
              <h2 className="ornament section-header">Future Seasons</h2>
              <div className="grid gap-4">
                {futureSeasons.map((season) => (
                  <SeasonCard key={season.id} season={season} battlePointsMap={battlePointsMap} reportCount={reportCounts.get(season.id) ?? 0} />
                ))}
              </div>
            </div>
          )}

          {/* Past Seasons */}
          {pastSeasons.length > 0 && (
            <div>
              <h2 className="ornament section-header">Past Seasons</h2>
              <div className="grid gap-4">
                {pastSeasons.map((season) => (
                  <SeasonCard key={season.id} season={season} battlePointsMap={battlePointsMap} reportCount={reportCounts.get(season.id) ?? 0} />
                ))}
              </div>
            </div>
          )}

          {seasons.length === 0 && (
            <p className="empty-text">No seasons yet. Check back soon!</p>
          )}
        </div>
      </div>
    </main>
  )
}
