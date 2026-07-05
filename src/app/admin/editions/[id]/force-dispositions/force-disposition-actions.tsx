'use client'

import ActionsMenu from '@/components/actions-menu'
import { useRouter } from 'next/navigation'
import { deleteForceDisposition } from './actions'

type ForceDispositionActionsProps = {
  editionId: number
  forceDispositionId: number
  forceDispositionName: string
}

export default function ForceDispositionActions({
  editionId,
  forceDispositionId,
  forceDispositionName,
}: ForceDispositionActionsProps) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${forceDispositionName}"?`)) return

    const result = await deleteForceDisposition(forceDispositionId)

    if (result.error) {
      alert(result.error)
      return
    }

    router.refresh()
  }

  return (
    <ActionsMenu
      items={[
        {
          label: 'Edit Force Disposition',
          href: `/admin/editions/${editionId}/force-dispositions/${forceDispositionId}/edit`,
        },
        { label: 'Delete Force Disposition', onClick: handleDelete, variant: 'danger' },
      ]}
    />
  )
}
