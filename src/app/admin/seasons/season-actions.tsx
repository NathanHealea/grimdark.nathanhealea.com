'use client'

import ActionsMenu from '@/components/actions-menu'
import { useRouter } from 'next/navigation'
import { deleteSeason } from './actions'

type SeasonActionsProps = {
  seasonId: number
  seasonName: string
}

export default function SeasonActions({ seasonId, seasonName }: SeasonActionsProps) {
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

    router.refresh()
  }

  return (
    <ActionsMenu
      items={[
        { label: 'View Season', href: `/seasons/${seasonId}` },
        { label: 'Edit Season', href: `/admin/seasons/${seasonId}/edit` },
        { label: 'Delete Season', onClick: handleDelete, variant: 'danger' },
      ]}
    />
  )
}
