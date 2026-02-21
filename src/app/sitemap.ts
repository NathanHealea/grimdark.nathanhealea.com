import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://grimdark.nathanhealea.com', lastModified: new Date() },
    { url: 'https://grimdark.nathanhealea.com/members', lastModified: new Date() },
    { url: 'https://grimdark.nathanhealea.com/battle-reports', lastModified: new Date() },
    { url: 'https://grimdark.nathanhealea.com/seasons', lastModified: new Date() },
  ]
}
