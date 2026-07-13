'use client'

import ActionsMenu from '@/components/actions-menu'
import { useRouter } from 'next/navigation'
import { deleteEdition, setDefaultEdition } from './actions'

type EditionActionsProps = {
  editionId: number
  editionName: string
  isDefault: boolean
}

export default function EditionActions({ editionId, editionName, isDefault }: EditionActionsProps) {
  const router = useRouter()

  async function handleSetDefault() {
    const result = await setDefaultEdition(editionId)

    if (result.error) {
      alert(result.error)
      return
    }

    router.refresh()
  }

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

    router.refresh()
  }

  const items = [
    { label: 'Edit Edition', href: `/admin/editions/${editionId}/edit` },
    { label: 'Manage Missions', href: `/admin/editions/${editionId}/missions` },
    { label: 'Manage Deployments', href: `/admin/editions/${editionId}/deployments` },
    ...(isDefault ? [] : [{ label: 'Set as Default', onClick: handleSetDefault }]),
    { label: 'Delete Edition', onClick: handleDelete, variant: 'danger' as const },
  ]

  return <ActionsMenu items={items} />
}
