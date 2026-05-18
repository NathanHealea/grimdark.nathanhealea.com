'use server'

import { getAuthUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { hasRole } from '@/lib/supabase/roles'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  type BattleReportFormState,
  validatePlayerId,
  validateFactionId,
  validateScore,
  validateOutcome,
  validateRounds,
  validateSelectId,
  validateEventDate,
  validateStatus,
  validateSeasonId,
  validateEditionId,
} from '@/modules/battle-report/validation'

export async function submitBattleReport(prevState: BattleReportFormState, formData: FormData): Promise<BattleReportFormState> {
  const auth = await getAuthUser({ withProfile: true })

  if (!auth) {
    return { error: 'You must be signed in to submit a battle report.' }
  }

  const { user, profile } = auth
  const isMember = profile.role === 'member' || profile.role === 'organizer'
  const isAdmin = await hasRole(user.id, 'admin')

  if (!isMember && !isAdmin) {
    return { error: 'You must be a member to submit battle reports.' }
  }

  const status = (formData.get('status') as string) ?? 'published'
  const eventDate = (formData.get('event_date') as string) ?? ''
  const attackerId = (formData.get('attacker_id') as string) ?? ''
  const attackerFactionId = (formData.get('attacker_faction_id') as string) ?? ''
  const attackerScore = (formData.get('attacker_score') as string) ?? ''
  const attackerOutcome = (formData.get('attacker_outcome') as string) ?? ''
  const defenderId = (formData.get('defender_id') as string) ?? ''
  const defenderFactionId = (formData.get('defender_faction_id') as string) ?? ''
  const defenderScore = (formData.get('defender_score') as string) ?? ''
  const defenderOutcome = (formData.get('defender_outcome') as string) ?? ''
  const editionId = (formData.get('edition_id') as string) ?? ''
  const missionId = (formData.get('mission_id') as string) ?? ''
  const deploymentId = (formData.get('deployment_id') as string) ?? ''
  const battlePointsId = (formData.get('battle_points_id') as string) ?? ''
  const rounds = (formData.get('rounds') as string) ?? ''
  const seasonId = (formData.get('season_id') as string) ?? ''
  const attackerTabled = formData.has('attacker_tabled')
  const defenderTabled = formData.has('defender_tabled')
  const attackerUnitsLost = (formData.get('attacker_units_lost') as string) ?? '0'
  const attackerModelsLost = (formData.get('attacker_models_lost') as string) ?? '0'
  const defenderUnitsLost = (formData.get('defender_units_lost') as string) ?? '0'
  const defenderModelsLost = (formData.get('defender_models_lost') as string) ?? '0'

  const errors: Record<string, string> = {}

  const statusError = validateStatus(status)
  if (statusError) errors.status = statusError

  const editionIdError = validateEditionId(editionId)
  if (editionIdError) errors.edition_id = editionIdError

  // Only validate fields when publishing
  if (status === 'published') {
    const eventDateError = validateEventDate(eventDate)
    if (eventDateError) errors.event_date = eventDateError

    const attackerIdError = validatePlayerId(attackerId)
    if (attackerIdError) errors.attacker_id = attackerIdError

    const attackerFactionIdError = validateFactionId(attackerFactionId)
    if (attackerFactionIdError) errors.attacker_faction_id = attackerFactionIdError

    const attackerScoreError = validateScore(attackerScore)
    if (attackerScoreError) errors.attacker_score = attackerScoreError

    const attackerOutcomeError = validateOutcome(attackerOutcome)
    if (attackerOutcomeError) errors.attacker_outcome = attackerOutcomeError

    const defenderIdError = validatePlayerId(defenderId)
    if (defenderIdError) errors.defender_id = defenderIdError

    const defenderFactionIdError = validateFactionId(defenderFactionId)
    if (defenderFactionIdError) errors.defender_faction_id = defenderFactionIdError

    const defenderScoreError = validateScore(defenderScore)
    if (defenderScoreError) errors.defender_score = defenderScoreError

    const defenderOutcomeError = validateOutcome(defenderOutcome)
    if (defenderOutcomeError) errors.defender_outcome = defenderOutcomeError

    const missionIdError = validateSelectId(missionId)
    if (missionIdError) errors.mission_id = missionIdError

    const deploymentIdError = validateSelectId(deploymentId)
    if (deploymentIdError) errors.deployment_id = deploymentIdError

    const battlePointsIdError = validateSelectId(battlePointsId)
    if (battlePointsIdError) errors.battle_points_id = battlePointsIdError

    const roundsError = validateRounds(rounds)
    if (roundsError) errors.rounds = roundsError
  }

  const seasonIdError = validateSeasonId(seasonId)
  if (seasonIdError) errors.season_id = seasonIdError

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  if (attackerId && defenderId && attackerId === defenderId) {
    return { errors: { defender_id: 'Attacker and defender cannot be the same player.' } }
  }

  const supabase = await createClient()

  // Non-admins can only assign current (date-in-range) published seasons
  if (seasonId && !isAdmin) {
    const d = new Date()
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const { data: season } = await supabase
      .from('seasons')
      .select('start_date, end_date, status')
      .eq('id', Number(seasonId))
      .single()
    if (!season || season.status !== 'published' || season.start_date > today || season.end_date < today) {
      return { errors: { season_id: 'You can only assign battle reports to the current season.' } }
    }
  }

  const insertData: Record<string, unknown> = {
    status,
    reported_by: profile.id,
    attacker_tabled: attackerTabled,
    defender_tabled: defenderTabled,
    attacker_units_lost: parseInt(attackerUnitsLost, 10) || 0,
    attacker_models_lost: parseInt(attackerModelsLost, 10) || 0,
    defender_units_lost: parseInt(defenderUnitsLost, 10) || 0,
    defender_models_lost: parseInt(defenderModelsLost, 10) || 0,
  }

  // For drafts, only include non-empty fields
  if (eventDate) insertData.event_date = eventDate
  if (attackerId) insertData.attacker_id = attackerId
  if (attackerFactionId) insertData.attacker_faction_id = attackerFactionId
  if (attackerScore) insertData.attacker_score = Number(attackerScore)
  if (attackerOutcome) insertData.attacker_outcome = attackerOutcome
  if (defenderId) insertData.defender_id = defenderId
  if (defenderFactionId) insertData.defender_faction_id = defenderFactionId
  if (defenderScore) insertData.defender_score = Number(defenderScore)
  if (defenderOutcome) insertData.defender_outcome = defenderOutcome
  if (missionId) insertData.mission_id = Number(missionId)
  if (deploymentId) insertData.deployment_id = Number(deploymentId)
  if (battlePointsId) insertData.battle_points_id = Number(battlePointsId)
  if (rounds) insertData.rounds = Number(rounds)
  if (editionId) insertData.edition_id = Number(editionId)
  if (seasonId) insertData.season_id = Number(seasonId)

  const { data: insertedReport, error } = await supabase
    .from('battle_reports')
    .insert(insertData)
    .select('id')
    .single()

  if (error || !insertedReport) {
    console.error('Failed to submit battle report:', error)
    return { error: 'Failed to submit battle report. Please try again.' }
  }

  // Insert round stats if provided
  const roundStatsJson = formData.get('round_stats_json') as string
  if (roundStatsJson) {
    try {
      const roundStats = JSON.parse(roundStatsJson) as Array<Record<string, string | number>>
      if (roundStats.length > 0 && roundStats.length <= 5) {
        const roundStatsRows = roundStats.map((rs) => ({
          battle_report_id: insertedReport.id,
          round_number: Number(rs.round_number),
          attacker_points_earned: parseInt(String(rs.attacker_points_earned), 10) || 0,
          attacker_units_lost: parseInt(String(rs.attacker_units_lost), 10) || 0,
          attacker_models_lost: parseInt(String(rs.attacker_models_lost), 10) || 0,
          defender_points_earned: parseInt(String(rs.defender_points_earned), 10) || 0,
          defender_units_lost: parseInt(String(rs.defender_units_lost), 10) || 0,
          defender_models_lost: parseInt(String(rs.defender_models_lost), 10) || 0,
        }))

        const { error: roundStatsError } = await supabase
          .from('battle_report_round_stats')
          .insert(roundStatsRows)

        if (roundStatsError) {
          console.error('Failed to insert round stats:', roundStatsError)
          return { errors: { round_stats: 'Battle report saved but round stats failed to save.' } }
        }
      }
    } catch {
      console.error('Failed to parse round stats JSON')
      return { errors: { round_stats: 'Invalid round stats data.' } }
    }
  }

  revalidatePath('/', 'layout')

  if (status === 'draft') {
    return { success: 'Draft saved successfully.' }
  }

  redirect('/battle-reports')
}
