import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getBattleReports } from '@/modules/battle-report/queries'
import { computeLeaderboard } from '@/modules/leaderboard/utils'
import LeaderboardTable from '@/modules/leaderboard/components/leaderboard-table'
import type { Profile } from '@/types/profile'

export const metadata: Metadata = { title: 'Leaderboard' }

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const [battleReports, { data: profiles }] = await Promise.all([
    getBattleReports(),
    supabase.from('profiles').select('*').in('role', ['member', 'organizer']),
  ])

  const standings = computeLeaderboard(battleReports)
  const profileMap = new Map(((profiles as Profile[]) ?? []).map((p) => [p.id, p]))

  return (
    <main className="flex flex-col items-center -mt-72 pt-72 min-h-screen w-full">
      <div className="w-full px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Leaderboard</h1>
            <p className="mt-2 text-base-content/60">Rankings based on published battle reports.</p>
          </div>

          <h2 className="text-xl ornament font-bold mb-4">Current Standings</h2>
          <LeaderboardTable entries={standings} profileMap={profileMap} />
        </div>
      </div>
    </main>
  )
}
