'use client'

import ActionsMenu from '@/components/actions-menu'
import { useRouter } from 'next/navigation'
import { deleteMission } from './actions'

type MissionActionsProps = {
  editionId: number
  missionId: number
  missionName: string
}

export default function MissionActions({ editionId, missionId, missionName }: MissionActionsProps) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${missionName}"?`)) return

    const result = await deleteMission(missionId)

    if (result.error) {
      alert(result.error)
      return
    }

    router.refresh()
  }

  return (
    <ActionsMenu
      items={[
        { label: 'Edit Mission', href: `/admin/editions/${editionId}/missions/${missionId}/edit` },
        { label: 'Delete Mission', onClick: handleDelete, variant: 'danger' },
      ]}
    />
  )
}
