import type { Metadata } from 'next'
import Link from 'next/link'

import { getAuthUser } from '@/lib/supabase/auth'
import { getUserRoles } from '@/lib/supabase/roles'
import { getGuides } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Guides',
  description: 'How-to guides for the Grimdark League. Learn how to join seasons, set up your profile, submit battle reports, and more.',
}

export default async function GuidesPage() {
  const auth = await getAuthUser()
  const userRoles = auth ? await getUserRoles(auth.user.id) : undefined

  const guides = getGuides(userRoles)

  const categories = [...new Set(guides.map((g) => g.category))]

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <div className="mb-8">
            <h1 className="text-h1">Guides</h1>
            <p className="mt-1 text-sm text-base-content/50">
              Learn how to use the Grimdark League — from joining a season to submitting battle reports.
            </p>
          </div>

          {guides.length === 0 ? (
            <p className="empty-text">No guides available.</p>
          ) : (
            categories.map((category) => (
              <div key={category} className="mb-8">
                <h2 className="ornament section-header">{category}</h2>
                <div className="grid gap-4">
                  {guides
                    .filter((g) => g.category === category)
                    .map((guide) => (
                      <Link key={guide.slug} href={`/guides/${guide.slug}`} className="card-interactive">
                        <div className="card-body p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-h3">{guide.title}</h3>
                              <p className="mt-1 text-sm text-base-content/60">{guide.description}</p>
                            </div>
                            {guide.role && (
                              <span className="badge badge-neutral badge-sm shrink-0 capitalize">{guide.role}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
