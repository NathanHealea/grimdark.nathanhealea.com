import type { Metadata } from 'next'
import Link from 'next/link'
import EditionForm from '../edition-form'

export const metadata: Metadata = { title: 'Create Edition' }

export default function CreateEditionPage() {
  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <div className="mb-8">
            <Link href="/admin/editions" className="btn-back">
              &larr; Back to Editions
            </Link>
            <h1 className="text-h1">Create Edition</h1>
          </div>

          <EditionForm />
        </div>
      </div>
    </main>
  )
}
