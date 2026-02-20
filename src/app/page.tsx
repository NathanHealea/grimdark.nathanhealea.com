import { createClient } from '@/lib/supabase/server'
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

export default function Home() {
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
            <button className="btn btn-outline btn-primary btn-lg">View Rankings</button>
          </div>

          <Suspense fallback={<StatsLoading />}>
            <Stats />
          </Suspense>
        </div>
      </section>

      <div className="bg-base-200 border-y border-base-300 py-3 overflow-hidden">
        <div className="ticker-track whitespace-nowrap">
          <span className="text-xs tracking-[0.15em] uppercase text-primary">
            ☠ SPACE MARINES &nbsp;·&nbsp; ☠ CHAOS SPACE MARINES &nbsp;·&nbsp; ☠ TYRANIDS &nbsp;·&nbsp; ☠ ORKS
            &nbsp;·&nbsp; ☠ NECRONS &nbsp;·&nbsp; ☠ AELDARI &nbsp;·&nbsp; ☠ T&apos;AU EMPIRE &nbsp;·&nbsp; ☠ DEATH GUARD
            &nbsp;·&nbsp; ☠ ASTRA MILITARUM &nbsp;·&nbsp; ☠ DRUKHARI &nbsp;·&nbsp; ☠ SISTERS OF BATTLE &nbsp;·&nbsp; ☠
            GREY KNIGHTS &nbsp;·&nbsp; ☠ WORLD EATERS &nbsp;·&nbsp; ☠ THOUSAND SONS &nbsp;·&nbsp;
          </span>
          <span className="text-xs tracking-[0.15em] uppercase text-primary" aria-hidden="true">
            ☠ SPACE MARINES &nbsp;·&nbsp; ☠ CHAOS SPACE MARINES &nbsp;·&nbsp; ☠ TYRANIDS &nbsp;·&nbsp; ☠ ORKS
            &nbsp;·&nbsp; ☠ NECRONS &nbsp;·&nbsp; ☠ AELDARI &nbsp;·&nbsp; ☠ T&apos;AU EMPIRE &nbsp;·&nbsp; ☠ DEATH GUARD
            &nbsp;·&nbsp; ☠ ASTRA MILITARUM &nbsp;·&nbsp; ☠ DRUKHARI &nbsp;·&nbsp; ☠ SISTERS OF BATTLE &nbsp;·&nbsp; ☠
            GREY KNIGHTS &nbsp;·&nbsp; ☠ WORLD EATERS &nbsp;·&nbsp; ☠ THOUSAND SONS &nbsp;·&nbsp;
          </span>
        </div>
      </div>
    </main>
  )
}
