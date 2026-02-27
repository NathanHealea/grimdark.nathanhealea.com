'use client'

import { useRouter } from 'next/navigation'
import { deleteSeason } from '../../actions'

type DeleteSeasonButtonProps = {
  seasonId: number
  seasonName: string
}

export default function DeleteSeasonButton({ seasonId, seasonName }: DeleteSeasonButtonProps) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${seasonName}"? Battle reports will be unlinked but not deleted.`)) {
      return
    }

    const result = await deleteSeason(seasonId)

    if (result.error) {
      alert(result.error)
      return
    }

    router.push('/admin/seasons')
  }

  return (
    <button type="button" onClick={handleDelete} className="btn btn-error btn-lg w-full">
      Delete Season
    </button>
  )
}
