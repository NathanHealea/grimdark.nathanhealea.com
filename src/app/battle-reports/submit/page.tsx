import { getAuthUser } from '@/lib/supabase/auth'
import { hasRole } from '@/lib/supabase/roles'
import { getMissions, getDeployments, getBattlePoints, getMembers, getMemberFactions } from '@/modules/battle-report/queries'
import { getFactions } from '@/modules/faction/queries'
import { redirect } from 'next/navigation'
import BattleReportForm from './battle-report-form'

export default async function SubmitBattleReportPage() {
  const auth = await getAuthUser()

  if (!auth) {
    redirect('/sign-in')
  }

  const [isMember, isAdmin] = await Promise.all([hasRole(auth.user.id, 'member'), hasRole(auth.user.id, 'admin')])

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

  const [missions, deployments, battlePoints, members, factions, memberFactions] = await Promise.all([
    getMissions(),
    getDeployments(),
    getBattlePoints(),
    getMembers(),
    getFactions(),
    getMemberFactions(),
  ])

  return (
    <main className="flex flex-col items-center -mt-72 pt-72 min-h-screen w-full">
    <div className="flex-1 flex items-center justify-center w-full px-4 py-24">
      <BattleReportForm
        missions={missions}
        deployments={deployments}
        battlePoints={battlePoints}
        members={members}
        factions={factions}
        memberFactions={memberFactions}
      />
    </div>
    </main>
  )
}
