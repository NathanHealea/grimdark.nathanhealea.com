import { getForceDispositionsByEditionId } from '@/modules/force-disposition/queries'
import { getEditionById } from '@/modules/edition/queries'
import { formatEditionLabel } from '@/types/edition'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ForceDispositionActions from './force-disposition-actions'
import ForceDispositionForm from './force-disposition-form'

export const metadata: Metadata = { title: 'Manage Force Dispositions' }

export default async function AdminEditionForceDispositionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const editionId = Number(id)

  if (!editionId) notFound()

  const edition = await getEditionById(editionId)
  if (!edition) notFound()

  const forceDispositions = await getForceDispositionsByEditionId(editionId)

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <div className="mb-8">
            <Link href="/admin/editions" className="btn-back">
              &larr; All Editions
            </Link>
            <h1 className="text-h1">{formatEditionLabel(edition)} Force Dispositions</h1>
            <p className="mt-1 text-sm text-base-content/50">
              Manage force dispositions for this edition. Disposition names must be unique within the edition.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="ornament section-header">Add Force Disposition</h2>
            <ForceDispositionForm editionId={edition.id} />
          </section>

          <section>
            <h2 className="ornament section-header">Force Dispositions ({forceDispositions.length})</h2>
            {forceDispositions.length === 0 ? (
              <p className="empty-text">No force dispositions yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {forceDispositions.map((forceDisposition) => (
                    <tr key={forceDisposition.id} className="hover">
                      <td className="font-semibold">{forceDisposition.name}</td>
                      <td className="text-sm text-base-content/60">
                        {forceDisposition.description ?? <span className="text-base-content/40">&mdash;</span>}
                      </td>
                      <td>
                        <ForceDispositionActions
                          editionId={edition.id}
                          forceDispositionId={forceDisposition.id}
                          forceDispositionName={forceDisposition.name}
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
