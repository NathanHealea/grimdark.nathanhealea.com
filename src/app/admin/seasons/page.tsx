import { getSeasons } from '@/modules/season/queries'
import { getBattlePoints } from '@/modules/battle-report/queries'
import type { BattlePoints } from '@/types/battle-report'
import Link from 'next/link'
import SeasonForm from './season-form'

function formatDate(dateString: string): string {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function AdminSeasonsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string }>
}) {
  const params = await searchParams
  const [seasons, battlePoints] = await Promise.all([getSeasons(), getBattlePoints()])

  const battlePointsMap = new Map<number, BattlePoints>(battlePoints.map((bp) => [bp.id, bp]))

  const editSeasonId = params.edit ? Number(params.edit) : null
  const showNewForm = params.new === 'true'
  const editSeason = editSeasonId ? seasons.find((s) => s.id === editSeasonId) : null

  return (
    <main className="flex flex-col items-center -mt-72 pt-72 min-h-screen w-full">
      <div className="w-full px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Season Management</h1>
              <p className="mt-2 text-base-content/60">Create and manage league seasons.</p>
            </div>
            {!showNewForm && !editSeason && (
              <Link href="/admin/seasons?new=true" className="btn btn-primary">
                Create Season
              </Link>
            )}
          </div>

          {/* New/Edit Form */}
          {(showNewForm || editSeason) && (
            <div className="mb-8">
              <SeasonForm battlePoints={battlePoints} season={editSeason ?? undefined} />
              <Link href="/admin/seasons" className="btn btn-ghost btn-sm mt-4">
                Cancel
              </Link>
            </div>
          )}

          {/* Seasons Table */}
          {seasons.length === 0 ? (
            <p className="text-base-content/50 italic">No seasons yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Dates</th>
                    <th>Battle Size</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {seasons.map((season) => {
                    const bp = battlePointsMap.get(season.battle_points_id)
                    return (
                      <tr key={season.id} className="hover">
                        <td className="font-semibold">{season.name}</td>
                        <td className="text-sm text-base-content/60">
                          {formatDate(season.start_date)} &ndash; {formatDate(season.end_date)}
                        </td>
                        <td className="text-sm">{bp ? `${bp.name} (${bp.size} pts)` : '—'}</td>
                        <td>
                          {season.is_active ? (
                            <span className="badge badge-success">Active</span>
                          ) : (
                            <span className="badge badge-ghost">Inactive</span>
                          )}
                        </td>
                        <td>
                          <Link
                            href={`/admin/seasons?edit=${season.id}`}
                            className="btn btn-ghost btn-xs"
                          >
                            Edit
                          </Link>
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
