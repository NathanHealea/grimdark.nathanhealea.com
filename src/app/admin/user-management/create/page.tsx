import { getFactions } from '@/modules/faction/queries'
import Link from 'next/link'
import CreateProfileForm from './create-profile-form'

export default async function CreateProfilePage() {
  const factions = await getFactions()

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <div className="mb-8">
            <Link href="/admin/user-management" className="btn-back">
              &larr; User Management
            </Link>
            <h1 className="text-h1">Create Profile</h1>
            <p className="mt-1 text-sm text-base-content/50">
              Create an unlinked profile for a player who hasn&apos;t signed up yet.
            </p>
          </div>

          <CreateProfileForm factions={factions} />
        </div>
      </div>
    </main>
  )
}
