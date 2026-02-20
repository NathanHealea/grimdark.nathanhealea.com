import { createClient } from '@/lib/supabase/server'
import { getFactions } from '@/modules/faction/queries'
import {
  getBattleReportById,
  getMissions,
  getDeployments,
  getBattlePoints,
} from '@/modules/battle-report/queries'
import type { Outcome } from '@/types/battle-report'
import type { Profile } from '@/types/profile'
import type { Faction } from '@/types/faction'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function outcomeBadge(outcome: Outcome) {
  const styles: Record<Outcome, string> = {
    win: 'badge badge-success',
    loss: 'badge badge-error',
    draw: 'badge badge-warning',
  }
  return <span className={styles[outcome]}>{outcome.charAt(0).toUpperCase() + outcome.slice(1)}</span>
}

function getFactionLabel(id: string, factionMap: Map<string, Faction>): string {
  const faction = factionMap.get(id)
  if (!faction) return 'Unknown Faction'
  if (faction.parent_id) {
    const parent = factionMap.get(faction.parent_id)
    if (parent) {
      if (parent.parent_id) {
        const grandparent = factionMap.get(parent.parent_id)
        if (grandparent) return `${grandparent.name} > ${parent.name} > ${faction.name}`
      }
      return `${parent.name} > ${faction.name}`
    }
  }
  return faction.name
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function BattleReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [report, { data: profiles }, factions, missions, deployments, battlePoints] =
    await Promise.all([
      getBattleReportById(id),
      (await createClient()).from('profiles').select('*'),
      getFactions(),
      getMissions(),
      getDeployments(),
      getBattlePoints(),
    ])

  if (!report) {
    notFound()
  }

  const profileMap = new Map((profiles as Profile[] ?? []).map((p) => [p.id, p]))
  const factionMap = new Map(factions.map((f) => [f.id, f]))
  const missionMap = new Map(missions.map((m) => [m.id, m]))
  const deploymentMap = new Map(deployments.map((d) => [d.id, d]))
  const battlePointsMap = new Map(battlePoints.map((bp) => [bp.id, bp]))

  const attacker = profileMap.get(report.attacker_id)
  const defender = profileMap.get(report.defender_id)
  const reportedBy = profileMap.get(report.reported_by)
  const mission = missionMap.get(report.mission_id)
  const deployment = deploymentMap.get(report.deployment_id)
  const bp = battlePointsMap.get(report.battle_points_id)

  return (
    <main className="flex flex-col items-center -mt-16 pt-16 min-h-screen">
    <div className="w-full px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link href="/battle-reports" className="link link-hover text-sm text-base-content/60">
            &larr; Back to Battle Reports
          </Link>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body gap-6">
            <div>
              <h1 className="card-title text-2xl">Battle Report</h1>
              <p className="text-sm text-base-content/60">{formatDate(report.event_date)}</p>
            </div>

            {/* Players */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Attacker */}
              <div className="rounded-lg bg-base-300 p-4">
                <p className="text-xs font-medium uppercase text-base-content/50 mb-2">Attacker</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/profile/${attacker?.profile_id}`}
                      className="link link-hover font-semibold truncate block"
                    >
                      {attacker?.display_name ?? 'Unknown'}
                    </Link>
                    <p className="text-sm text-base-content/60 truncate">
                      {getFactionLabel(report.attacker_faction_id, factionMap)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-2xl font-bold">{report.attacker_score}</span>
                    {outcomeBadge(report.attacker_outcome)}
                  </div>
                </div>
              </div>

              {/* Defender */}
              <div className="rounded-lg bg-base-300 p-4">
                <p className="text-xs font-medium uppercase text-base-content/50 mb-2">Defender</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/profile/${defender?.profile_id}`}
                      className="link link-hover font-semibold truncate block"
                    >
                      {defender?.display_name ?? 'Unknown'}
                    </Link>
                    <p className="text-sm text-base-content/60 truncate">
                      {getFactionLabel(report.defender_faction_id, factionMap)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-2xl font-bold">{report.defender_score}</span>
                    {outcomeBadge(report.defender_outcome)}
                  </div>
                </div>
              </div>
            </div>

            {/* Game Details */}
            <div className="rounded-lg bg-base-300 p-4">
              <p className="text-xs font-medium uppercase text-base-content/50 mb-3">Game Details</p>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div>
                  <p className="text-base-content/50">Mission</p>
                  <p className="font-medium">{mission?.name ?? 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-base-content/50">Deployment</p>
                  <p className="font-medium">{deployment?.name ?? 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-base-content/50">Battle Size</p>
                  <p className="font-medium">{bp ? `${bp.name} (${bp.size} pts)` : 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-base-content/50">Rounds Played</p>
                  <p className="font-medium">{report.rounds}</p>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="text-xs text-base-content/40">
              Reported by {reportedBy?.display_name ?? 'Unknown'} on {formatDate(report.created_at)}
            </div>
          </div>
        </div>
      </div>
    </div>
    </main>
  )
}
