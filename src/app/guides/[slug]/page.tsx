import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getGuide, getGuideSlugs } from '@/lib/content';
import { getAuthUser } from '@/lib/supabase/auth';
import { getUserRoles } from '@/lib/supabase/roles';
import GuideContent from '@/modules/guides/components/guide-content';

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
    redirect('/unauthorized')
  }

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <Link href="/guides" className="btn-back">
            <ArrowLeftIcon className="size-4" />
            Guides
          </Link>

          <GuideContent content={guide.content} />
        </div>
      </div>
    </main>
  )
}
