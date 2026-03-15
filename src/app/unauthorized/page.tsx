import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldExclamationIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Unauthorized',
  description: 'You do not have permission to access this page.',
}

export default function UnauthorizedPage() {
  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content flex flex-col items-center justify-center text-center py-24">
          <ShieldExclamationIcon className="size-16 text-base-content/30 mb-6" />
          <h1 className="text-h1 mb-2">Unauthorized</h1>
          <p className="text-base-content/60 mb-8">You do not have permission to access this page.</p>
          <Link href="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    </main>
  )
}
