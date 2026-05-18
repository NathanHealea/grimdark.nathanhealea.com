import { getDeploymentById } from '@/modules/battle-report/queries'
import { getEditionById } from '@/modules/edition/queries'
import { formatEditionLabel } from '@/types/edition'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DeploymentForm from '../../deployment-form'
import DeploymentDeleteButton from './deployment-delete-button'

export const metadata: Metadata = { title: 'Edit Deployment' }

export default async function EditDeploymentPage({
  params,
}: {
  params: Promise<{ id: string; deploymentId: string }>
}) {
  const { id, deploymentId } = await params
  const editionId = Number(id)
  const dId = Number(deploymentId)

  if (!editionId || !dId) notFound()

  const [edition, deployment] = await Promise.all([getEditionById(editionId), getDeploymentById(dId)])

  if (!edition || !deployment) notFound()
  if (deployment.edition_id !== edition.id) notFound()

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <div className="mb-8">
            <Link href={`/admin/editions/${edition.id}/deployments`} className="btn-back">
              &larr; {formatEditionLabel(edition)} Deployments
            </Link>
            <h1 className="text-h1">Edit Deployment</h1>
          </div>

          <section className="mb-8">
            <DeploymentForm editionId={edition.id} deployment={deployment} />
          </section>

          <section>
            <h2 className="ornament section-header">Danger Zone</h2>
            <DeploymentDeleteButton
              editionId={edition.id}
              deploymentId={deployment.id}
              deploymentName={deployment.name}
            />
          </section>
        </div>
      </div>
    </main>
  )
}
