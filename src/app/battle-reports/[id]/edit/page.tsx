import { getAuthUser } from '@/lib/supabase/auth'
import { hasRole } from '@/lib/supabase/roles'
import {
  getBattlePoints,
  getBattleReportById,
  getDeployments,
  getMemberFactions,
  getMembers,
  getMissions,
} from '@/modules/battle-report/queries'
import { getFactions } from '@/modules/faction/queries'
import { getSeasons } from '@/modules/season/queries'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import BattleReportForm from '@/modules/battle-report/components/battle-report-form'
import Link from 'next/link';

export const metadata: Metadata = { title: 'Edit Battle Report' }

export default async function EditBattleReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const auth = await getAuthUser({ withProfile: true })

  if (!auth) {
    redirect('/sign-in')
  }

  const { user, profile } = auth
  const isAdmin = await hasRole(user.id, 'admin')

  const report = await getBattleReportById(id)

  if (!report) {
    notFound()
  }

  // Only the reporter or an admin can edit
  if (report.reported_by !== profile.id && !isAdmin) {
    return (
      <main className="flex flex-col items-center -mt-72 pt-72 min-h-screen">
        <div className="flex-1 flex items-center justify-center w-full px-4 py-24">
          <div className="card w-full max-w-md bg-base-200 shadow-xl">
            <div className="card-body">
              <h1 className="card-title text-2xl">Unauthorized</h1>
              <p className="text-base-content/70">You do not have permission to edit this battle report.</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const [missions, deployments, battlePoints, members, factionsList, memberFactions, seasons] = await Promise.all([
    getMissions(),
    getDeployments(),
    getBattlePoints(),
    getMembers(),
    getFactions(),
    getMemberFactions(),
    getSeasons({ includeAll: isAdmin }),
  ])

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          {/* Header */}
          <div className="mb-8">
            <Link href={`/battle-reports/${id}`} className="btn-back">
              &larr; View report
            </Link>
            <h1 className="text-h1">Edit Battle Report</h1>
            <p className="mt-1 text-sm text-base-content/50">Update this battle report.</p>
          </div>
          <BattleReportForm
            missions={missions}
            deployments={deployments}
            battlePoints={battlePoints}
            members={members}
            factions={factionsList}
            memberFactions={memberFactions}
            seasons={seasons}
            isAdmin={isAdmin}
            defaultValues={report}
            reportId={id}
          />
        </div>
      </div>
    </main>
  )
}
