'use client'

import { useRouter } from 'next/navigation'
import { deleteEdition } from '../../actions'

type DeleteEditionButtonProps = {
  editionId: number
  editionName: string
}

export default function DeleteEditionButton({ editionId, editionName }: DeleteEditionButtonProps) {
  const router = useRouter()

  async function handleDelete() {
    if (
      !confirm(
        `Are you sure you want to delete "${editionName}"? Its missions and deployments will be deleted too. This cannot be undone.`
      )
    ) {
      return
    }

    const result = await deleteEdition(editionId)

    if (result.error) {
      alert(result.error)
      return
    }

    router.push('/admin/editions')
  }

  return (
    <button type="button" onClick={handleDelete} className="btn btn-error w-full">
      Delete Edition
    </button>
  )
}
