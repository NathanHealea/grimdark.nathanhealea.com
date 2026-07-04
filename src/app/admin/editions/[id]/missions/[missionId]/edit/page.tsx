import { getMissionById } from '@/modules/battle-report/queries'
import { getForceDispositionsByEditionId } from '@/modules/force-disposition/queries'
import { getEditionById } from '@/modules/edition/queries'
import { formatEditionLabel } from '@/types/edition'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MissionForm from '../../mission-form'
import MissionDeleteButton from './mission-delete-button'

export const metadata: Metadata = { title: 'Edit Mission' }

export default async function EditMissionPage({
  params,
}: {
  params: Promise<{ id: string; missionId: string }>
}) {
  const { id, missionId } = await params
  const editionId = Number(id)
  const mId = Number(missionId)

  if (!editionId || !mId) notFound()

  const [edition, mission, forceDispositions] = await Promise.all([
    getEditionById(editionId),
    getMissionById(mId),
    getForceDispositionsByEditionId(editionId),
  ])

  if (!edition || !mission) notFound()
  if (mission.edition_id !== edition.id) notFound()

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <div className="mb-8">
            <Link href={`/admin/editions/${edition.id}/missions`} className="btn-back">
              &larr; {formatEditionLabel(edition)} Missions
            </Link>
            <h1 className="text-h1">Edit Mission</h1>
          </div>

          <section className="mb-8">
            <MissionForm editionId={edition.id} mission={mission} forceDispositions={forceDispositions} />
          </section>

          <section>
            <h2 className="ornament section-header">Danger Zone</h2>
            <MissionDeleteButton
              editionId={edition.id}
              missionId={mission.id}
              missionName={mission.name}
            />
          </section>
        </div>
      </div>
    </main>
  )
}
