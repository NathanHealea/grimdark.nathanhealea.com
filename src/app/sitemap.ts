import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = 'https://grimdark.nathanhealea.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [{ data: profiles }, { data: battleReports }, { data: seasons }] = await Promise.all([
    supabase
      .from('profiles')
      .select('profile_id, updated_at')
      .in('role', ['member', 'organizer']),
    supabase
      .from('battle_reports')
      .select('id, updated_at')
      .eq('status', 'published'),
    supabase
      .from('seasons')
      .select('id, updated_at')
      .eq('status', 'published'),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date() },
    { url: `${BASE_URL}/members`, lastModified: new Date() },
    { url: `${BASE_URL}/battle-reports`, lastModified: new Date() },
    { url: `${BASE_URL}/seasons`, lastModified: new Date() },
    { url: `${BASE_URL}/leaderboard`, lastModified: new Date() },
  ]

  const profileRoutes: MetadataRoute.Sitemap = (profiles ?? []).map((p) => ({
    url: `${BASE_URL}/profile/${p.profile_id}`,
    lastModified: new Date(p.updated_at),
  }))

  const battleReportRoutes: MetadataRoute.Sitemap = (battleReports ?? []).map((r) => ({
    url: `${BASE_URL}/battle-reports/${r.id}`,
    lastModified: new Date(r.updated_at),
  }))

  const seasonRoutes: MetadataRoute.Sitemap = (seasons ?? []).map((s) => ({
    url: `${BASE_URL}/seasons/${s.id}`,
    lastModified: new Date(s.updated_at),
  }))

  return [...staticRoutes, ...profileRoutes, ...battleReportRoutes, ...seasonRoutes]
}
