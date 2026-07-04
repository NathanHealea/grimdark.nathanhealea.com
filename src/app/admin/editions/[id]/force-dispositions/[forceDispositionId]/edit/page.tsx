import { getForceDispositionById } from '@/modules/force-disposition/queries'
import { getEditionById } from '@/modules/edition/queries'
import { formatEditionLabel } from '@/types/edition'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ForceDispositionForm from '../../force-disposition-form'
import ForceDispositionDeleteButton from './force-disposition-delete-button'

export const metadata: Metadata = { title: 'Edit Force Disposition' }

export default async function EditForceDispositionPage({
  params,
}: {
  params: Promise<{ id: string; forceDispositionId: string }>
}) {
  const { id, forceDispositionId } = await params
  const editionId = Number(id)
  const fdId = Number(forceDispositionId)

  if (!editionId || !fdId) notFound()

  const [edition, forceDisposition] = await Promise.all([getEditionById(editionId), getForceDispositionById(fdId)])

  if (!edition || !forceDisposition) notFound()
  if (forceDisposition.edition_id !== edition.id) notFound()

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <div className="mb-8">
            <Link href={`/admin/editions/${edition.id}/force-dispositions`} className="btn-back">
              &larr; {formatEditionLabel(edition)} Force Dispositions
            </Link>
            <h1 className="text-h1">Edit Force Disposition</h1>
          </div>

          <section className="mb-8">
            <ForceDispositionForm editionId={edition.id} forceDisposition={forceDisposition} />
          </section>

          <section>
            <h2 className="ornament section-header">Danger Zone</h2>
            <ForceDispositionDeleteButton
              editionId={edition.id}
              forceDispositionId={forceDisposition.id}
              forceDispositionName={forceDisposition.name}
            />
          </section>
        </div>
      </div>
    </main>
  )
}
