import { createClient } from '@/lib/supabase/server'
import { getEditions } from '@/modules/edition/queries'
import type { Metadata } from 'next'
import Link from 'next/link'
import EditionActions from './edition-actions'

export const metadata: Metadata = { title: 'Manage Editions' }

function tally(rows: { edition_id: number | null }[] | null): Map<number, number> {
  const counts = new Map<number, number>()
  for (const row of rows ?? []) {
    if (row.edition_id == null) continue
    counts.set(row.edition_id, (counts.get(row.edition_id) ?? 0) + 1)
  }
  return counts
}

export default async function AdminEditionsPage() {
  const supabase = await createClient()

  const [editions, missions, deployments, dispositions, reports] = await Promise.all([
    getEditions({ includeAll: true }),
    supabase.from('missions').select('edition_id'),
    supabase.from('deployments').select('edition_id'),
    supabase.from('force_dispositions').select('edition_id'),
    supabase.from('battle_reports').select('edition_id'),
  ])

  const missionCounts = tally(missions.data)
  const deploymentCounts = tally(deployments.data)
  const dispositionCounts = tally(dispositions.data)
  const reportCounts = tally(reports.data)

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-h1">Edition Management</h1>
              <p className="mt-2 text-base-content/60">Create and manage game editions.</p>
            </div>
            <Link href="/admin/editions/new" className="btn btn-primary">
              Create Edition
            </Link>
          </div>

          {editions.length === 0 ? (
            <p className="empty-text">No editions yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Short Name</th>
                  <th>Status</th>
                  <th className="text-center">Missions</th>
                  <th className="text-center">Deployments</th>
                  <th className="text-center">Dispositions</th>
                  <th className="text-center">Reports</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {editions.map((edition) => (
                  <tr key={edition.id} className="hover">
                    <td className="font-semibold">{edition.name}</td>
                    <td className="text-sm text-base-content/60">{edition.short_name}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {edition.status === 'draft' ? (
                          <span className="badge badge-warning">Draft</span>
                        ) : (
                          <span className="badge badge-success">Published</span>
                        )}
                        {edition.is_default && <span className="badge badge-info">Default</span>}
                      </div>
                    </td>
                    <td className="text-center">{missionCounts.get(edition.id) ?? 0}</td>
                    <td className="text-center">{deploymentCounts.get(edition.id) ?? 0}</td>
                    <td className="text-center">{dispositionCounts.get(edition.id) ?? 0}</td>
                    <td className="text-center">{reportCounts.get(edition.id) ?? 0}</td>
                    <td>
                      <EditionActions
                        editionId={edition.id}
                        editionName={edition.name}
                        isDefault={edition.is_default}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
