'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteDeployment } from '../../actions'

type DeploymentDeleteButtonProps = {
  editionId: number
  deploymentId: number
  deploymentName: string
}

export default function DeploymentDeleteButton({
  editionId,
  deploymentId,
  deploymentName,
}: DeploymentDeleteButtonProps) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${deploymentName}"?`)) return

    setError(null)
    setPending(true)
    const result = await deleteDeployment(deploymentId)
    setPending(false)

    if (result.error) {
      setError(result.error)
      return
    }

    router.push(`/admin/editions/${editionId}/deployments`)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      )}
      <button type="button" onClick={handleDelete} disabled={pending} className="btn btn-error w-fit">
        {pending ? 'Deleting…' : 'Delete Deployment'}
      </button>
    </div>
  )
}
