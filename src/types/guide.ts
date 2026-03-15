export type GuideRole = 'member' | 'organizer' | 'admin' | null

export interface GuideMeta {
  title: string
  description: string
  category: string
  order: number
  role: GuideRole
  slug: string
}

export interface Guide extends GuideMeta {
  content: string
}
