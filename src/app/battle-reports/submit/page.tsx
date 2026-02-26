import { getAuthUser } from '@/lib/supabase/auth'
import { hasRole } from '@/lib/supabase/roles'
import {
  getBattlePoints,
  getDeployments,
  getMemberFactions,
  getMembers,
  getMissions,
} from '@/modules/battle-report/queries'
import { getFactions } from '@/modules/faction/queries'
import { getSeasons } from '@/modules/season/queries'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import BattleReportForm from '@/modules/battle-report/components/battle-report-form'

export default async function SubmitBattleReportPage() {
  const auth = await getAuthUser({ withProfile: true })

  if (!auth) {
    redirect('/sign-in')
  }

  const { user, profile } = auth
  const isMember = profile.role === 'member' || profile.role === 'organizer'
  const isAdmin = await hasRole(user.id, 'admin')

  if (!isMember && !isAdmin) {
    return (
      <main className="flex flex-col items-center -mt-72 pt-72 min-h-screen">
        <div className="flex-1 flex items-center justify-center w-full px-4 py-24">
          <div className="card w-full max-w-md bg-base-200 shadow-xl">
            <div className="card-body">
              <h1 className="card-title text-2xl">Unauthorized</h1>
              <p className="text-base-content/70">You must be a member to submit battle reports.</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const [missions, deployments, battlePoints, members, factions, memberFactions, seasons] = await Promise.all([
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
            <Link href="/battle-reports" className="btn-back">
              &larr; All Battle Reports
            </Link>
            <h1 className="text-h1">Submit Battle Report</h1>
            <p className="mt-1 text-sm text-base-content/50">Record the results of a Warhammer 40K game.</p>
          </div>

          <BattleReportForm
            missions={missions}
            deployments={deployments}
            battlePoints={battlePoints}
            members={members}
            factions={factions}
            memberFactions={memberFactions}
            seasons={seasons}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </main>
  )
}
