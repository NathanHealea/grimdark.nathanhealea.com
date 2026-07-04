import { getAuthUser } from '@/lib/supabase/auth'
import { hasRole } from '@/lib/supabase/roles'
import {
  getBattlePoints,
  getDeploymentsByEditionId,
  getEditionsForSubmitForm,
  getMemberFactions,
  getMembers,
  getMissionsByEditionId,
} from '@/modules/battle-report/queries'
import { getFactions } from '@/modules/faction/queries'
import { getForceDispositionsByEditionId } from '@/modules/force-disposition/queries'
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

  const { editions: publishedEditions, defaultEditionId } = await getEditionsForSubmitForm()

  const [missionResults, deploymentResults, dispositionResults, battlePoints, members, factions, memberFactions, seasons] =
    await Promise.all([
      Promise.all(publishedEditions.map((e) => getMissionsByEditionId(e.id))),
      Promise.all(publishedEditions.map((e) => getDeploymentsByEditionId(e.id))),
      Promise.all(publishedEditions.map((e) => getForceDispositionsByEditionId(e.id))),
      getBattlePoints(),
      getMembers(),
      getFactions(),
      getMemberFactions(),
      getSeasons({ includeAll: isAdmin }),
    ])

  const missionsByEdition = Object.fromEntries(
    publishedEditions.map((e, i) => [e.id, missionResults[i]])
  )
  const deploymentsByEdition = Object.fromEntries(
    publishedEditions.map((e, i) => [e.id, deploymentResults[i]])
  )
  const dispositionsByEdition = Object.fromEntries(
    publishedEditions.map((e, i) => [e.id, dispositionResults[i]])
  )

  // Flat lists for legacy prop compatibility (missions/deployments for the default edition)
  const defaultMissions = defaultEditionId ? (missionsByEdition[defaultEditionId] ?? []) : []
  const defaultDeployments = defaultEditionId ? (deploymentsByEdition[defaultEditionId] ?? []) : []

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
            missions={defaultMissions}
            deployments={defaultDeployments}
            battlePoints={battlePoints}
            members={members}
            factions={factions}
            memberFactions={memberFactions}
            seasons={seasons}
            isAdmin={isAdmin}
            publishedEditions={publishedEditions}
            defaultEditionId={defaultEditionId}
            missionsByEdition={missionsByEdition}
            deploymentsByEdition={deploymentsByEdition}
            dispositionsByEdition={dispositionsByEdition}
          />
        </div>
      </div>
    </main>
  )
}
