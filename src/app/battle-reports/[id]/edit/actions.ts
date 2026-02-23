'use server'

import { getAuthUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { hasRole } from '@/lib/supabase/roles'
import { revalidatePath } from 'next/cache'
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
} from '@/modules/battle-report/validation'

export async function updateBattleReport(
  reportId: string,
  prevState: BattleReportFormState,
  formData: FormData,
): Promise<BattleReportFormState> {
  const auth = await getAuthUser({ withProfile: true })

  if (!auth) {
    return { error: 'You must be signed in to update a battle report.' }
  }

  const { user, profile } = auth
  const isAdmin = await hasRole(user.id, 'admin')

  // Verify ownership or admin
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('battle_reports')
    .select('reported_by, status')
    .eq('id', reportId)
    .single()

  if (!existing) {
    return { error: 'Battle report not found.' }
  }

  if (existing.reported_by !== profile.id && !isAdmin) {
    return { error: 'You do not have permission to edit this battle report.' }
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
  const missionId = (formData.get('mission_id') as string) ?? ''
  const deploymentId = (formData.get('deployment_id') as string) ?? ''
  const battlePointsId = (formData.get('battle_points_id') as string) ?? ''
  const rounds = (formData.get('rounds') as string) ?? ''

  const errors: Record<string, string> = {}

  const statusError = validateStatus(status)
  if (statusError) errors.status = statusError

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

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  if (attackerId && defenderId && attackerId === defenderId) {
    return { errors: { defender_id: 'Attacker and defender cannot be the same player.' } }
  }

  const updateData: Record<string, unknown> = {
    status,
    event_date: eventDate || null,
    attacker_id: attackerId || null,
    attacker_faction_id: attackerFactionId || null,
    attacker_score: attackerScore ? Number(attackerScore) : null,
    attacker_outcome: attackerOutcome || null,
    defender_id: defenderId || null,
    defender_faction_id: defenderFactionId || null,
    defender_score: defenderScore ? Number(defenderScore) : null,
    defender_outcome: defenderOutcome || null,
    mission_id: missionId ? Number(missionId) : null,
    deployment_id: deploymentId ? Number(deploymentId) : null,
    battle_points_id: battlePointsId ? Number(battlePointsId) : null,
    rounds: rounds ? Number(rounds) : null,
  }

  const { error } = await supabase
    .from('battle_reports')
    .update(updateData)
    .eq('id', reportId)

  if (error) {
    console.error('Failed to update battle report:', error)
    return { error: 'Failed to update battle report. Please try again.' }
  }

  revalidatePath('/', 'layout')

  if (status === 'draft') {
    return { success: 'Draft saved successfully.' }
  }

  return { success: 'Battle report published successfully.' }
}
