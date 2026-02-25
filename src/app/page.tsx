import ScrollBanner from '@/components/scroll-banner'
import { createClient } from '@/lib/supabase/server'
import { getBattleReports, getBattleReportsBySeasonId } from '@/modules/battle-report/queries'
import { getFactions } from '@/modules/faction/queries'
import LeaderboardSection from '@/modules/leaderboard/components/leaderboard-section'
import LeaderboardTable from '@/modules/leaderboard/components/leaderboard-table'
import { computeLeaderboard } from '@/modules/leaderboard/utils'
import { getCurrentSeason } from '@/modules/season/queries'
import type { Profile } from '@/types/profile'
import Link from 'next/link'
import { Suspense } from 'react'

async function getMemberCount(): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  if (error) {
    console.error('Failed to fetch member count:', error)
    return 0
  }
  return count ?? 0
}

async function getBattleReportCount(): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase.from('battle_reports').select('*', { count: 'exact', head: true })
  if (error) {
    console.error('Failed to fetch battle report count:', error)
    return 0
  }
  return count ?? 0
}

async function getPlayerFactionCount(): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('profile_factions').select('faction_id')
  if (error) {
    console.error('Failed to fetch player faction count:', error)
    return 0
  }
  const uniqueFactions = new Set(data.map((row) => row.faction_id))
  return uniqueFactions.size
}

function StatsLoading() {
  return (
    <div className="stats stats-horizontal shadow mt-16 bg-base-200 border border-base-300 rounded-box">
      <div className="stat place-items-center">
        <div className="stat-value text-gold stat-loading">—</div>
        <div className="stat-desc text-neutral-content tracking-widest uppercase text-xs mt-1">Commanders</div>
      </div>
      <div className="stat place-items-center">
        <div className="stat-value text-gold stat-loading">—</div>
        <div className="stat-desc text-neutral-content tracking-widest uppercase text-xs mt-1">Battles Logged</div>
      </div>
      <div className="stat place-items-center">
        <div className="stat-value text-gold stat-loading">—</div>
        <div className="stat-desc text-neutral-content tracking-widest uppercase text-xs mt-1">Factions</div>
      </div>
    </div>
  )
}

async function Stats() {
  const [memberCount, battleReportCount, factionCount] = await Promise.all([
    getMemberCount(),
    getBattleReportCount(),
    getPlayerFactionCount(),
  ])

  return (
    <div className="stats stats-vertical md:stats-horizontal shadow mt-16 bg-base-200 border border-base-300 rounded-box">
      <div className="stat place-items-center">
        <div className="stat-value text-gold">{memberCount}</div>
        <div className="stat-desc text-neutral-content tracking-widest uppercase text-xs mt-1">Commanders</div>
      </div>
      <div className="stat place-items-center">
        <div className="stat-value text-gold">{battleReportCount}</div>
        <div className="stat-desc text-neutral-content tracking-widest uppercase text-xs mt-1">Battles Logged</div>
      </div>
      <div className="stat place-items-center">
        <div className="stat-value text-gold">{factionCount}</div>
        <div className="stat-desc text-neutral-content tracking-widest uppercase text-xs mt-1">Factions</div>
      </div>
    </div>
  )
}

function HomeLeaderboardLoading() {
  return (
    <div>
      <div className="flex justify-center mb-6">
        <div className="join">
          <div className="join-item skeleton h-8 w-24" />
          <div className="join-item skeleton h-8 w-24" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="table bg-base-200 rounded-box">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Player</th>
              <th className="text-center">GP</th>
              <th className="text-center">W</th>
              <th className="text-center">L</th>
              <th className="text-center">D</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td><div className="skeleton h-5 w-6" /></td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="skeleton h-10 w-10 rounded-full" />
                    <div className="skeleton h-5 w-32" />
                  </div>
                </td>
                <td className="text-center"><div className="skeleton mx-auto h-5 w-8" /></td>
                <td className="text-center"><div className="skeleton mx-auto h-5 w-8" /></td>
                <td className="text-center"><div className="skeleton mx-auto h-5 w-8" /></td>
                <td className="text-center"><div className="skeleton mx-auto h-5 w-8" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

async function HomeLeaderboard() {
  const supabase = await createClient()
  const [currentSeason, allReports, { data: profiles }] = await Promise.all([
    getCurrentSeason(),
    getBattleReports(),
    supabase.from('profiles').select('*').in('role', ['member', 'organizer']),
  ])

  const seasonReports = currentSeason ? await getBattleReportsBySeasonId(currentSeason.id) : []

  const profileMap = new Map(((profiles as Profile[]) ?? []).map((p) => [p.id, p]))
  const overallStandings = computeLeaderboard(allReports)
  const seasonStandings = currentSeason ? computeLeaderboard(seasonReports) : []

  return (
    <LeaderboardSection
      overallTable={<LeaderboardTable entries={overallStandings} profileMap={profileMap} />}
      seasonTable={currentSeason ? <LeaderboardTable entries={seasonStandings} profileMap={profileMap} /> : null}
      seasonName={currentSeason?.name ?? null}
      seasonId={currentSeason?.id ?? null}
    />
  )
}

export default async function Home() {
  const factions = await getFactions()
  const rootIds = new Set(factions.filter((f) => f.parent_id === null).map((f) => f.id))
  const factionNames = factions
    .filter((f) => f.parent_id !== null && rootIds.has(f.parent_id))
    .map((f) => f.name.toUpperCase())

  return (
    <main className="flex flex-col items-center -mt-72 pt-72 min-h-screen w-full">
      <section className="hero-glow relative overflow-hidden py-28 px-6  w-full">
        <div className="absolute top-8 left-8 text-primary opacity-5 text-[8rem] leading-none pointer-events-none select-none">
          ⚙
        </div>
        <div className="absolute bottom-8 right-8 text-primary opacity-5 text-[8rem] leading-none pointer-events-none select-none">
          ⚙
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
            <span className="text-gold">For the Glory</span>
            <br />
            <span className="text-base-content">of the Grimdark.</span>
          </h1>

          <p className="text-lg text-neutral-content max-w-xl mx-auto mb-10 leading-relaxed">
            A Warhammer 40,000 league based in Eugene/Springfield, Oregon. Tracking our battles, our members, and our
            factions as we wage war across the grimdark universe. Join us in chronicling our campaigns and celebrating
            our victories (and defeats). The Emperor protects!
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link href={'/sign-up'} className="btn btn-primary btn-lg">
              Join the League
            </Link>
          </div>

          <Suspense fallback={<StatsLoading />}>
            <Stats />
          </Suspense>

        </div>
      </section>

      <section className="bg-base-200 border-y border-base-300 py-3 overflow-hidden">
        <ScrollBanner items={factionNames} />
      </section>

      <section className="w-full px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="ornament mb-6 text-center text-sm font-semibold uppercase tracking-widest">Leaderboard</h2>
          <Suspense fallback={<HomeLeaderboardLoading />}>
            <HomeLeaderboard />
          </Suspense>
        </div>
      </section>
    </main>
  )
}
