'use client'

import ActionsMenu from '@/components/actions-menu'
import { useRouter } from 'next/navigation'
import { deleteBattleReport } from '@/app/battle-reports/[id]/edit/actions'

type BattleReportActionsProps = {
  reportId: string
  reportLabel: string
}

export default function BattleReportActions({ reportId, reportLabel }: BattleReportActionsProps) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete the battle report "${reportLabel}"? This action cannot be undone.`)) {
      return
    }

    const result = await deleteBattleReport(reportId)

    if (result.error) {
      alert(result.error)
      return
    }

    router.refresh()
  }

  return (
    <ActionsMenu
      items={[
        { label: 'View Report', href: `/battle-reports/${reportId}` },
        { label: 'Edit Report', href: `/battle-reports/${reportId}/edit` },
        { label: 'Delete Report', onClick: handleDelete, variant: 'danger' },
      ]}
    />
  )
}
