import { getDeploymentsByEditionId } from '@/modules/battle-report/queries'
import { getEditionById } from '@/modules/edition/queries'
import { formatEditionLabel } from '@/types/edition'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DeploymentActions from './deployment-actions'
import DeploymentForm from './deployment-form'

export const metadata: Metadata = { title: 'Manage Deployments' }

export default async function AdminEditionDeploymentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const editionId = Number(id)

  if (!editionId) notFound()

  const edition = await getEditionById(editionId)
  if (!edition) notFound()

  const deployments = await getDeploymentsByEditionId(editionId)

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <div className="mb-8">
            <Link href="/admin/editions" className="btn-back">
              &larr; All Editions
            </Link>
            <h1 className="text-h1">{formatEditionLabel(edition)} Deployments</h1>
            <p className="mt-1 text-sm text-base-content/50">
              Manage deployments for this edition. Deployment names must be unique within the edition.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="ornament section-header">Add Deployment</h2>
            <DeploymentForm editionId={edition.id} />
          </section>

          <section>
            <h2 className="ornament section-header">Deployments ({deployments.length})</h2>
            {deployments.length === 0 ? (
              <p className="empty-text">No deployments yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deployments.map((deployment) => (
                    <tr key={deployment.id} className="hover">
                      <td className="font-semibold">{deployment.name}</td>
                      <td>
                        <DeploymentActions
                          editionId={edition.id}
                          deploymentId={deployment.id}
                          deploymentName={deployment.name}
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
