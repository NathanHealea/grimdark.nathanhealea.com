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
    <main className="flex flex-col items-center -mt-72 pt-72 min-h-screen w-full">
      <div className="w-full px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <Link href="/admin/seasons" className="btn btn-ghost btn-sm mb-4 -ml-2">
              &larr; Back to Seasons
            </Link>
            <h1 className="text-3xl font-bold">Edit Season</h1>
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
