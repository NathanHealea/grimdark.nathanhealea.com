import fs from 'fs'
import path from 'path'

import matter from 'gray-matter'

import type { Guide, GuideMeta, GuideRole } from '@/types/guide'
import type { Role } from '@/types/role'

const guidesDirectory = path.join(process.cwd(), 'src/content/guides')

const ROLE_HIERARCHY: Record<string, number> = {
  admin: 3,
  organizer: 2,
  member: 1,
}

function getMaxRoleLevel(userRoles: Role[]): number {
  return userRoles.reduce((max, role) => {
    const level = ROLE_HIERARCHY[role] ?? 0
    return level > max ? level : max
  }, 0)
}

export function canAccessGuide(guideRole: GuideRole, userRoles?: Role[]): boolean {
  if (!guideRole) return true

  if (!userRoles || userRoles.length === 0) return false

  const requiredLevel = ROLE_HIERARCHY[guideRole] ?? 0
  const userLevel = getMaxRoleLevel(userRoles)

  return userLevel >= requiredLevel
}

export function getGuides(userRoles?: Role[]): GuideMeta[] {
  if (!fs.existsSync(guidesDirectory)) return []

  const files = fs.readdirSync(guidesDirectory).filter((file) => file.endsWith('.md'))

  const guides: GuideMeta[] = files
    .map((file) => {
      const slug = file.replace(/\.md$/, '')
      const filePath = path.join(guidesDirectory, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(fileContent)

      return {
        title: data.title ?? '',
        description: data.description ?? '',
        category: data.category ?? '',
        order: data.order ?? 0,
        role: (data.role as GuideRole) ?? null,
        slug,
      }
    })
    .filter((guide) => canAccessGuide(guide.role, userRoles))
    .sort((a, b) => a.order - b.order)

  return guides
}

export function getGuide(slug: string, userRoles?: Role[]): Guide | null {
  const filePath = path.join(guidesDirectory, `${slug}.md`)

  if (!fs.existsSync(filePath)) return null

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)

  const guideRole = (data.role as GuideRole) ?? null

  if (!canAccessGuide(guideRole, userRoles)) return null

  return {
    title: data.title ?? '',
    description: data.description ?? '',
    category: data.category ?? '',
    order: data.order ?? 0,
    role: guideRole,
    slug,
    content,
  }
}

export function getGuideSlugs(): string[] {
  if (!fs.existsSync(guidesDirectory)) return []

  return fs
    .readdirSync(guidesDirectory)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''))
}
