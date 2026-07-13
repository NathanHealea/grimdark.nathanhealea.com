import { getEditionById } from '@/modules/edition/queries'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import EditionForm from '../../edition-form'
import DeleteEditionButton from './delete-edition-button'

export const metadata: Metadata = { title: 'Edit Edition' }

export default async function EditEditionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const editionId = Number(id)

  if (!editionId) notFound()

  const edition = await getEditionById(editionId)
  if (!edition) notFound()

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <div className="mb-8">
            <Link href="/admin/editions" className="btn-back">
              &larr; Back to Editions
            </Link>
            <h1 className="text-h1">Edit Edition</h1>
            <p className="mt-1 text-sm text-base-content/50">
              Editing <span className="font-semibold">{edition.name}</span>
            </p>
          </div>

          <EditionForm edition={edition} />

          <div className="mt-8">
            <h2 className="ornament section-header">Danger Zone</h2>
            <fieldset className="form-section">
              <p className="mb-4 text-sm text-base-content/60">
                Deleting this edition will remove its missions and deployments. It is blocked while any battle report
                references it.
              </p>
              <DeleteEditionButton editionId={edition.id} editionName={edition.name} />
            </fieldset>
          </div>
        </div>
      </div>
    </main>
  )
}
