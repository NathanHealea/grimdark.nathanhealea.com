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

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  if (attackerId === defenderId) {
    return { errors: { defender_id: 'Attacker and defender cannot be the same player.' } }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('battle_reports').insert({
    event_date: eventDate,
    attacker_id: attackerId,
    attacker_faction_id: attackerFactionId,
    attacker_score: Number(attackerScore),
    attacker_outcome: attackerOutcome,
    defender_id: defenderId,
    defender_faction_id: defenderFactionId,
    defender_score: Number(defenderScore),
    defender_outcome: defenderOutcome,
    mission_id: Number(missionId),
    deployment_id: Number(deploymentId),
    battle_points_id: Number(battlePointsId),
    rounds: Number(rounds),
    reported_by: profile.id,
  })

  if (error) {
    console.error('Failed to submit battle report:', error)
    return { error: 'Failed to submit battle report. Please try again.' }
  }

  revalidatePath('/', 'layout')
  return { success: 'Battle report submitted successfully.' }
}
