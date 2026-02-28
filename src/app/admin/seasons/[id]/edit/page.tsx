import { createClient } from '@/lib/supabase/server'
import { getBattlePoints } from '@/modules/battle-report/queries'
import { getFactions } from '@/modules/faction/queries'
import { getSeasonById, getSeasonRoster } from '@/modules/season/queries'
import type { Profile } from '@/types/profile'
import { formatSeasonName } from '@/types/season'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SeasonForm from '../../season-form'
import DeleteSeasonButton from './delete-season-button'
import RosterManager from './roster-manager'

export default async function EditSeasonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const seasonId = Number(id)

  if (Number.isNaN(seasonId)) {
    notFound()
  }

  const supabase = await createClient()

  const [battlePoints, season, factions, roster, { data: allProfiles }] = await Promise.all([
    getBattlePoints(),
    getSeasonById(seasonId),
    getFactions(),
    getSeasonRoster(seasonId),
    supabase.from('profiles').select('*').order('display_name'),
  ])

  if (!season) {
    notFound()
  }

  const profiles = (allProfiles ?? []) as Profile[]

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

          <div className="mt-8">
            <h2 className="ornament section-header">Roster ({roster.length})</h2>
            <RosterManager seasonId={season.id} roster={roster} profiles={profiles} factions={factions} />
          </div>

          <div className="mt-8">
            <h2 className="ornament section-header">Danger Zone</h2>
            <fieldset className="form-section">
              <p className="mb-4 text-sm text-base-content/60">
                Deleting this season will unlink all associated battle reports but will not delete them.
              </p>
              <DeleteSeasonButton seasonId={season.id} seasonName={formatSeasonName(season)} />
            </fieldset>
          </div>
        </div>
      </div>
    </main>
  )
}
