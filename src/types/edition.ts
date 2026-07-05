export type EditionStatus = 'draft' | 'published'

export type Edition = {
  id: number
  name: string
  short_name: string
  description: string | null
  status: EditionStatus
  is_default: boolean
  created_at: string
  updated_at: string
}

export function formatEditionLabel(edition: Pick<Edition, 'short_name'>): string {
  return edition.short_name
}
