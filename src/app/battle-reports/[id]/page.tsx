import type { Metadata } from 'next'
import { getAuthUser } from '@/lib/supabase/auth'
import { hasRole } from '@/lib/supabase/roles'
import { createClient } from '@/lib/supabase/server'
import { getFactions } from '@/modules/faction/queries'
import {
  getBattleReportById,
  getMissionById,
  getMissionsByEditionId,
  getDeploymentById,
  getBattlePoints,
  getRoundStatsByReportId,
} from '@/modules/battle-report/queries'
import { resolvePrimaryMissions, formatPrimaryMissionPairing } from '@/modules/battle-report/utils'
import { getForceDispositionsByEditionId } from '@/modules/force-disposition/queries'
import { getEditionById } from '@/modules/edition/queries'
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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const report = await getBattleReportById(id)
  if (!report) return { title: 'Battle Report' }
  const { data: profiles } = await supabase.from('profiles').select('id, display_name')
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.display_name ?? 'Unknown']))
  const attacker = report.attacker_id ? profileMap.get(report.attacker_id) ?? 'Unknown' : 'TBD'
  const defender = report.defender_id ? profileMap.get(report.defender_id) ?? 'Unknown' : 'TBD'
  const prefix = report.status === 'draft' ? 'Draft — ' : ''
  const title = `${prefix}Battle Report — ${attacker} vs ${defender}`

  const scorePart =
    report.attacker_score != null && report.defender_score != null
      ? ` (${report.attacker_score}–${report.defender_score})`
      : ''
  const outcomePart = report.attacker_outcome
    ? `. ${attacker} ${report.attacker_outcome === 'win' ? 'wins' : report.attacker_outcome === 'loss' ? 'loses' : 'draws'}`
    : ''
  const description = `${attacker} vs ${defender}${scorePart}${outcomePart}. Grimdark League battle report.`

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Grimdark League`,
      description,
      url: `/battle-reports/${id}`,
    },
  }
}

export default async function BattleReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const report = await getBattleReportById(id)

  if (!report) {
    notFound()
  }

  const supabase = await createClient()

  const hasDispositions =
    report.attacker_force_disposition_id != null && report.defender_force_disposition_id != null

  const [auth, { data: profiles }, factions, mission, deployment, battlePoints, roundStats, edition, dispositions, editionMissions] =
    await Promise.all([
      getAuthUser({ withProfile: true }),
      supabase.from('profiles').select('*'),
      getFactions(),
      report.mission_id ? getMissionById(report.mission_id) : Promise.resolve(null),
      report.deployment_id ? getDeploymentById(report.deployment_id) : Promise.resolve(null),
      getBattlePoints(),
      getRoundStatsByReportId(id),
      getEditionById(report.edition_id),
      hasDispositions ? getForceDispositionsByEditionId(report.edition_id) : Promise.resolve([]),
      hasDispositions ? getMissionsByEditionId(report.edition_id) : Promise.resolve([]),
    ])

  const isAdmin = auth ? await hasRole(auth.user.id, 'admin') : false
  const isReporter = auth ? auth.profile.id === report.reported_by : false
  const canEdit = isAdmin || isReporter
  const isDraft = report.status === 'draft'

  const profileMap = new Map((profiles as Profile[] ?? []).map((p) => [p.id, p]))
  const factionMap = new Map(factions.map((f) => [f.id, f]))
  const battlePointsMap = new Map(battlePoints.map((bp) => [bp.id, bp]))

  const attacker = report.attacker_id ? profileMap.get(report.attacker_id) : null
  const defender = report.defender_id ? profileMap.get(report.defender_id) : null
  const reportedBy = profileMap.get(report.reported_by)
  const bp = report.battle_points_id ? battlePointsMap.get(report.battle_points_id) : null

  const dispositionMap = new Map(dispositions.map((d) => [d.id, d]))
  const attackerDisposition = report.attacker_force_disposition_id
    ? dispositionMap.get(report.attacker_force_disposition_id)
    : null
  const defenderDisposition = report.defender_force_disposition_id
    ? dispositionMap.get(report.defender_force_disposition_id)
    : null
  const { attackerPrimary, defenderPrimary } = resolvePrimaryMissions(report, editionMissions)
  const primaryPairing = formatPrimaryMissionPairing(attackerPrimary, defenderPrimary)

  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          {/* Header */}
          <div className="mb-8">
            <Link href="/battle-reports" className="btn-back">
              &larr; All Battle Reports
            </Link>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-h1">Battle Report</h1>
                  {isDraft && <span className="badge badge-warning">Draft</span>}
                </div>
                {report.event_date && (
                  <p className="mt-1 text-sm text-base-content/50">{formatDate(report.event_date)}</p>
                )}
              </div>
              {canEdit && (
                <Link href={`/battle-reports/${id}/edit`} className="btn btn-outline btn-sm shrink-0">
                  {isDraft ? 'Edit Draft' : 'Edit Report'}
                </Link>
              )}
            </div>
            <p className="mt-2 text-xs text-base-content/40">
              Reported by {reportedBy?.display_name ?? 'Unknown'} on {formatDate(report.created_at)}
            </p>
          </div>

          {/* Players */}
          <div className="mb-8">
            <h2 className="ornament section-header">Players</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Attacker */}
              <div className="rounded-lg bg-base-200 p-4">
                <p className="label-meta mb-2">Attacker</p>
                {attacker ? (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/profile/${attacker.profile_id}`}
                          className="link link-hover font-semibold truncate block"
                        >
                          {attacker.display_name ?? 'Unknown'}
                        </Link>
                        {report.attacker_faction_id && (
                          <p className="text-sm text-base-content/60 truncate">
                            {getFactionLabel(report.attacker_faction_id, factionMap)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {report.attacker_score != null && (
                          <span className="text-2xl font-bold">{report.attacker_score}</span>
                        )}
                        {report.attacker_outcome && outcomeBadge(report.attacker_outcome)}
                        {report.attacker_tabled && <span className="badge badge-neutral">Tabled</span>}
                      </div>
                    </div>
                    {(report.attacker_units_lost > 0 || report.attacker_models_lost > 0) && (
                      <div className="mt-2 flex gap-4 text-sm text-base-content/60">
                        <span>{report.attacker_units_lost} units lost</span>
                        <span>{report.attacker_models_lost} models lost</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-base-content/40 italic">Not yet assigned</p>
                )}
                {attackerDisposition && (
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="text-base-content/60">
                      Force Disposition:{' '}
                      <span className="font-medium text-base-content">{attackerDisposition.name}</span>
                    </p>
                    <p className="text-base-content/60">
                      Primary Mission:{' '}
                      <span className="font-medium text-base-content">{attackerPrimary?.name ?? '—'}</span>
                    </p>
                    {report.attacker_secondary_mode && (
                      <p className="text-base-content/60">
                        Secondaries:{' '}
                        <span className="font-medium text-base-content capitalize">{report.attacker_secondary_mode}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Defender */}
              <div className="rounded-lg bg-base-200 p-4">
                <p className="label-meta mb-2">Defender</p>
                {defender ? (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/profile/${defender.profile_id}`}
                          className="link link-hover font-semibold truncate block"
                        >
                          {defender.display_name ?? 'Unknown'}
                        </Link>
                        {report.defender_faction_id && (
                          <p className="text-sm text-base-content/60 truncate">
                            {getFactionLabel(report.defender_faction_id, factionMap)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {report.defender_score != null && (
                          <span className="text-2xl font-bold">{report.defender_score}</span>
                        )}
                        {report.defender_outcome && outcomeBadge(report.defender_outcome)}
                        {report.defender_tabled && <span className="badge badge-neutral">Tabled</span>}
                      </div>
                    </div>
                    {(report.defender_units_lost > 0 || report.defender_models_lost > 0) && (
                      <div className="mt-2 flex gap-4 text-sm text-base-content/60">
                        <span>{report.defender_units_lost} units lost</span>
                        <span>{report.defender_models_lost} models lost</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-base-content/40 italic">Not yet assigned</p>
                )}
                {defenderDisposition && (
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="text-base-content/60">
                      Force Disposition:{' '}
                      <span className="font-medium text-base-content">{defenderDisposition.name}</span>
                    </p>
                    <p className="text-base-content/60">
                      Primary Mission:{' '}
                      <span className="font-medium text-base-content">{defenderPrimary?.name ?? '—'}</span>
                    </p>
                    {report.defender_secondary_mode && (
                      <p className="text-base-content/60">
                        Secondaries:{' '}
                        <span className="font-medium text-base-content capitalize">{report.defender_secondary_mode}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Game Details */}
          <div>
            <h2 className="ornament section-header">Game Details</h2>
            <div className="rounded-lg bg-base-200 p-4">
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div className="col-span-2">
                  <p className="text-base-content/50">Edition</p>
                  <p className="font-medium">{edition?.name ?? 'Unknown'}</p>
                </div>
                {hasDispositions ? (
                  <div>
                    <p className="text-base-content/50">Primary Missions</p>
                    <p className="font-medium">{primaryPairing ?? '—'}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-base-content/50">Mission</p>
                    <p className="font-medium">{mission?.name ?? (isDraft ? 'Not set' : 'Unknown')}</p>
                  </div>
                )}
                <div>
                  <p className="text-base-content/50">Deployment</p>
                  <p className="font-medium">{deployment?.name ?? (isDraft ? 'Not set' : 'Unknown')}</p>
                </div>
                <div>
                  <p className="text-base-content/50">Battle Size</p>
                  <p className="font-medium">{bp ? `${bp.name} (${bp.size} pts)` : (isDraft ? 'Not set' : 'Unknown')}</p>
                </div>
                <div>
                  <p className="text-base-content/50">Rounds Played</p>
                  <p className="font-medium">{report.rounds ?? (isDraft ? 'Not set' : 'Unknown')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Round Stats */}
          {roundStats.length > 0 && (
            <div className="mt-8">
              <h2 className="ornament section-header">Round Stats</h2>
              <div className="flex flex-col gap-4">
                {roundStats.map((rs) => (
                  <div key={rs.id} className="rounded-lg bg-base-200 p-4">
                    <h3 className="mb-3 font-semibold">Round {rs.round_number}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="label-meta mb-1">Attacker</p>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-base-content/50">Points</p>
                            <p className="font-medium">{rs.attacker_points_earned}</p>
                          </div>
                          <div>
                            <p className="text-base-content/50">Units Lost</p>
                            <p className="font-medium">{rs.attacker_units_lost}</p>
                          </div>
                          <div>
                            <p className="text-base-content/50">Models Lost</p>
                            <p className="font-medium">{rs.attacker_models_lost}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="label-meta mb-1">Defender</p>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-base-content/50">Points</p>
                            <p className="font-medium">{rs.defender_points_earned}</p>
                          </div>
                          <div>
                            <p className="text-base-content/50">Units Lost</p>
                            <p className="font-medium">{rs.defender_units_lost}</p>
                          </div>
                          <div>
                            <p className="text-base-content/50">Models Lost</p>
                            <p className="font-medium">{rs.defender_models_lost}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
