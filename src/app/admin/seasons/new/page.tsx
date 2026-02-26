import { getBattlePoints } from '@/modules/battle-report/queries'
import { getNextSeasonNumber } from '@/modules/season/queries'
import Link from 'next/link'
import SeasonForm from '../season-form'

export default async function CreateSeasonPage() {
  const [battlePoints, nextNumber] = await Promise.all([getBattlePoints(), getNextSeasonNumber()])

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <div className="mb-8">
            <Link href="/admin/seasons" className="btn-back">
              &larr; Back to Seasons
            </Link>
            <h1 className="text-h1">Create Season</h1>
          </div>

          <SeasonForm battlePoints={battlePoints} nextNumber={nextNumber} />
        </div>
      </div>
    </main>
  )
}
