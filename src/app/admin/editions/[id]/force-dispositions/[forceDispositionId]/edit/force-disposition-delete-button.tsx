'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteForceDisposition } from '../../actions'

type ForceDispositionDeleteButtonProps = {
  editionId: number
  forceDispositionId: number
  forceDispositionName: string
}

export default function ForceDispositionDeleteButton({
  editionId,
  forceDispositionId,
  forceDispositionName,
}: ForceDispositionDeleteButtonProps) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${forceDispositionName}"?`)) return

    setError(null)
    setPending(true)
    const result = await deleteForceDisposition(forceDispositionId)
    setPending(false)

    if (result.error) {
      setError(result.error)
      return
    }

    router.push(`/admin/editions/${editionId}/force-dispositions`)
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
        {pending ? 'Deleting…' : 'Delete Force Disposition'}
      </button>
    </div>
  )
}
