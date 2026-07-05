'use client'

import ActionsMenu from '@/components/actions-menu'
import { useRouter } from 'next/navigation'
import { deleteDeployment } from './actions'

type DeploymentActionsProps = {
  editionId: number
  deploymentId: number
  deploymentName: string
}

export default function DeploymentActions({ editionId, deploymentId, deploymentName }: DeploymentActionsProps) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${deploymentName}"?`)) return

    const result = await deleteDeployment(deploymentId)

    if (result.error) {
      alert(result.error)
      return
    }

    router.refresh()
  }

  return (
    <ActionsMenu
      items={[
        { label: 'Edit Deployment', href: `/admin/editions/${editionId}/deployments/${deploymentId}/edit` },
        { label: 'Delete Deployment', onClick: handleDelete, variant: 'danger' },
      ]}
    />
  )
}
