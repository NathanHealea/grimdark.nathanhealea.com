import { getBattlePoints } from '@/modules/battle-report/queries'
import { getSeasonById } from '@/modules/season/queries'
import { formatSeasonName } from '@/types/season'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SeasonForm from '../../season-form'

export default async function EditSeasonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const seasonId = Number(id)

  if (Number.isNaN(seasonId)) {
    notFound()
  }

  const [battlePoints, season] = await Promise.all([getBattlePoints(), getSeasonById(seasonId)])

  if (!season) {
    notFound()
  }

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <div className="mb-8">
            <Link href="/admin/seasons" className="btn-back">
              &larr; Back to Seasons
            </Link>
            <h1 className="text-h1">Edit Season</h1>
            <p className="mt-1 text-sm text-base-content/50">
              Editing <span className="font-semibold">{formatSeasonName(season)}</span>
            </p>
          </div>

          <SeasonForm battlePoints={battlePoints} season={season} />
        </div>
      </div>
    </main>
  )
}
