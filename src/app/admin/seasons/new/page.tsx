import { getBattlePoints } from '@/modules/battle-report/queries'
import { getNextSeasonNumber } from '@/modules/season/queries'
import Link from 'next/link'
import SeasonForm from '../season-form'

export default async function CreateSeasonPage() {
  const [battlePoints, nextNumber] = await Promise.all([getBattlePoints(), getNextSeasonNumber()])

  return (
    <main className="flex flex-col items-center -mt-72 pt-72 min-h-screen w-full">
      <div className="w-full px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <Link href="/admin/seasons" className="btn btn-ghost btn-sm mb-4 -ml-2">
              &larr; Back to Seasons
            </Link>
            <h1 className="text-3xl font-bold">Create Season</h1>
          </div>

          <SeasonForm battlePoints={battlePoints} nextNumber={nextNumber} />
        </div>
      </div>
    </main>
  )
}
