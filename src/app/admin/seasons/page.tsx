import { getBattlePoints } from '@/modules/battle-report/queries'
import { getSeasons } from '@/modules/season/queries'
import type { BattlePoints } from '@/types/battle-report'
import { formatSeasonName, isCurrentSeason } from '@/types/season'
import Link from 'next/link'
import SeasonActions from './season-actions'

function formatDate(dateString: string): string {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function AdminSeasonsPage() {
  const [seasons, battlePoints] = await Promise.all([getSeasons({ includeAll: true }), getBattlePoints()])

  const battlePointsMap = new Map<number, BattlePoints>(battlePoints.map((bp) => [bp.id, bp]))

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-h1">Season Management</h1>
              <p className="mt-2 text-base-content/60">Create and manage league seasons.</p>
            </div>
            <Link href="/admin/seasons/new" className="btn btn-primary">
              Create Season
            </Link>
          </div>

          {/* Seasons Table */}
          {seasons.length === 0 ? (
            <p className="empty-text">No seasons yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Dates</th>
                  <th>Battle Size</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {seasons.map((season) => {
                  const bp = battlePointsMap.get(season.battle_points_id)
                  return (
                    <tr key={season.id} className="hover">
                      <td className="font-semibold">{formatSeasonName(season)}</td>
                      <td className="text-sm text-base-content/60">
                        {formatDate(season.start_date)} &ndash; {formatDate(season.end_date)}
                      </td>
                      <td className="text-sm">{bp ? `${bp.name} (${bp.size} pts)` : '—'}</td>
                      <td className="flex flex-wrap gap-1">
                        {season.status === 'draft' ? (
                          <span className="badge badge-warning">Draft</span>
                        ) : (
                          <span className="badge badge-success">Published</span>
                        )}
                        {isCurrentSeason(season) && <span className="badge badge-info">Current</span>}
                      </td>
                      <td>
                        <SeasonActions seasonId={season.id} seasonName={formatSeasonName(season)} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
