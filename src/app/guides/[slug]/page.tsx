import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

import { getAuthUser } from '@/lib/supabase/auth'
import { getUserRoles } from '@/lib/supabase/roles'
import { getGuide, getGuideSlugs } from '@/lib/content'
import GuideContent from '@/modules/guides/components/guide-content'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getGuideSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuide(slug)

  if (!guide) {
    return { title: 'Guide Not Found' }
  }

  return {
    title: guide.title,
    description: guide.description,
  }
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params

  const auth = await getAuthUser()
  const userRoles = auth ? await getUserRoles(auth.user.id) : undefined

  const guide = getGuide(slug, userRoles)

  if (!guide) {
    redirect('/guides')
  }

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <Link href="/guides" className="btn-back">
            <ArrowLeftIcon className="size-4" />
            Guides
          </Link>

          <div className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-h1">{guide.title}</h1>
              {guide.role && (
                <span className="badge badge-neutral badge-sm shrink-0 capitalize">{guide.role}</span>
              )}
            </div>
            <p className="mt-1 text-sm text-base-content/50">{guide.description}</p>
          </div>

          <GuideContent content={guide.content} />
        </div>
      </div>
    </main>
  )
}
