import type { Metadata } from 'next'
import { getAuthUser } from '@/lib/supabase/auth'
import { getDraftBattleReports } from '@/modules/battle-report/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = { title: 'My Drafts' }

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function DraftBattleReportsPage() {
  const auth = await getAuthUser({ withProfile: true })

  if (!auth) {
    redirect('/sign-in')
  }

  const { profile } = auth
  const drafts = await getDraftBattleReports(profile.id)

  return (
    <main className="flex flex-col items-center -mt-72 pt-72 min-h-screen w-full">
      <div className="w-full px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <Link href="/battle-reports" className="btn btn-ghost btn-sm mb-4 -ml-2">
              &larr; All Battle Reports
            </Link>
            <h1 className="text-3xl font-bold">My Drafts</h1>
            <p className="mt-1 text-sm text-base-content/50">
              Battle reports you&apos;ve started but haven&apos;t published yet.
            </p>
          </div>

          <div>
            <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">
              Drafts ({drafts.length})
            </h2>

            {drafts.length === 0 ? (
              <p className="text-base-content/50 italic">No drafts yet.</p>
            ) : (
              <div className="grid gap-4">
                {drafts.map((draft) => (
                  <Link
                    key={draft.id}
                    href={`/battle-reports/${draft.id}/edit`}
                    className="card bg-base-200 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="card-body gap-2 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="badge badge-warning badge-sm">Draft</span>
                          <span className="text-sm text-base-content/50">
                            {draft.event_date ? formatDate(draft.event_date) : 'No date set'}
                          </span>
                        </div>
                        <span className="text-xs text-base-content/40">
                          Updated {formatDate(draft.updated_at)}
                        </span>
                      </div>
                      <p className="text-sm text-base-content/70">
                        {draft.attacker_id || draft.defender_id
                          ? 'Partially filled out'
                          : 'Empty draft'}
                        {draft.rounds != null && ` \u00b7 ${draft.rounds} rounds`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
