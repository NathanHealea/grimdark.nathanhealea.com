'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteMission } from '../../actions'

type MissionDeleteButtonProps = {
  editionId: number
  missionId: number
  missionName: string
}

export default function MissionDeleteButton({ editionId, missionId, missionName }: MissionDeleteButtonProps) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${missionName}"?`)) return

    setError(null)
    setPending(true)
    const result = await deleteMission(missionId)
    setPending(false)

    if (result.error) {
      setError(result.error)
      return
    }

    router.push(`/admin/editions/${editionId}/missions`)
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
        {pending ? 'Deleting…' : 'Delete Mission'}
      </button>
    </div>
  )
}
