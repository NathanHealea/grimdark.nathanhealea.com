import { getMissionsByEditionId } from '@/modules/battle-report/queries'
import { getEditionById } from '@/modules/edition/queries'
import { formatEditionLabel } from '@/types/edition'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MissionActions from './mission-actions'
import MissionForm from './mission-form'

export const metadata: Metadata = { title: 'Manage Missions' }

export default async function AdminEditionMissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const editionId = Number(id)

  if (!editionId) notFound()

  const edition = await getEditionById(editionId)
  if (!edition) notFound()

  const missions = await getMissionsByEditionId(editionId)

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <div className="mb-8">
            <Link href="/admin/editions" className="btn-back">
              &larr; All Editions
            </Link>
            <h1 className="text-h1">{formatEditionLabel(edition)} Missions</h1>
            <p className="mt-1 text-sm text-base-content/50">
              Manage missions for this edition. Mission names must be unique within the edition.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="ornament section-header">Add Mission</h2>
            <MissionForm editionId={edition.id} />
          </section>

          <section>
            <h2 className="ornament section-header">Missions ({missions.length})</h2>
            {missions.length === 0 ? (
              <p className="empty-text">No missions yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {missions.map((mission) => (
                    <tr key={mission.id} className="hover">
                      <td className="font-semibold">{mission.name}</td>
                      <td>
                        <MissionActions
                          editionId={edition.id}
                          missionId={mission.id}
                          missionName={mission.name}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
