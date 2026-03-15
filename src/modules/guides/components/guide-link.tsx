import { BookOpenIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { getAuthUser } from '@/lib/supabase/auth'

type GuideLinkProps = {
  href: string
  label: string
  className?: string
}

export default async function GuideLink({ href, label, className }: GuideLinkProps) {
  const auth = await getAuthUser()

  if (!auth) return null

  return (
    <Link
      href={href}
      className={`flex items-center gap-1 text-xs text-base-content/40 hover:text-primary transition-colors shrink-0 ${className ?? ''}`}
    >
      <BookOpenIcon className="size-3.5" />
      {label}
    </Link>
  )
}
