import type { FormState } from '@/types/forms'
import type { Outcome, BattleReportStatus, SecondaryMode } from '@/types/battle-report'

export type BattleReportFormState = FormState<{
  attacker_id: string
  attacker_faction_id: string
  attacker_score: string
  attacker_outcome: string
  defender_id: string
  defender_faction_id: string
  defender_score: string
  defender_outcome: string
  event_date: string
  edition_id: string
  mission_id: string
  attacker_force_disposition_id: string
  defender_force_disposition_id: string
  attacker_secondary_mode: string
  defender_secondary_mode: string
  deployment_id: string
  battle_points_id: string
  rounds: string
  status: string
  season_id: string
  round_stats: string
}>

const VALID_STATUSES: BattleReportStatus[] = ['draft', 'published']

export function validateStatus(value: string): string | null {
  if (!value) {
    return 'Status is required.'
  }

  if (!VALID_STATUSES.includes(value as BattleReportStatus)) {
    return 'Status must be draft or published.'
  }

  return null
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const VALID_OUTCOMES: Outcome[] = ['win', 'loss', 'draw']

export function validatePlayerId(value: string): string | null {
  if (!value) {
    return 'Player is required.'
  }

  if (!UUID_PATTERN.test(value)) {
    return 'Invalid player selection.'
  }

  return null
}

export function validateFactionId(value: string): string | null {
  if (!value) {
    return 'Faction is required.'
  }

  if (!UUID_PATTERN.test(value)) {
    return 'Invalid faction selection.'
  }

  return null
}

export function validateScore(value: string): string | null {
  if (value === '') {
    return 'Score is required.'
  }

  const num = Number(value)

  if (!Number.isInteger(num) || num < 0) {
    return 'Score must be a non-negative integer.'
  }

  return null
}

export function validateOutcome(value: string): string | null {
  if (!value) {
    return 'Outcome is required.'
  }

  if (!VALID_OUTCOMES.includes(value as Outcome)) {
    return 'Outcome must be win, loss, or draw.'
  }

  return null
}

export function validateRounds(value: string): string | null {
  if (!value) {
    return 'Rounds is required.'
  }

  const num = Number(value)

  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return 'Rounds must be between 1 and 5.'
  }

  return null
}

export function validateEventDate(value: string): string | null {
  if (!value) {
    return 'Event date is required.'
  }

  const parsed = new Date(value)

  if (isNaN(parsed.getTime())) {
    return 'Invalid date format.'
  }

  return null
}

export function validateSeasonId(value: string): string | null {
  if (!value) return null // optional field

  const num = Number(value)

  if (!Number.isInteger(num) || num < 1) {
    return 'Invalid season selection.'
  }

  return null
}

export function validateEditionId(value: string): string | null {
  if (!value) {
    return 'Edition is required.'
  }

  const num = Number(value)

  if (!Number.isInteger(num) || num < 1) {
    return 'Invalid edition selection.'
  }

  return null
}

export function validateRoundStatField(value: string): string | null {
  const num = Number(value)

  if (!Number.isInteger(num) || num < 0) {
    return 'Must be a non-negative integer.'
  }

  return null
}

export function validateSelectId(value: string): string | null {
  if (!value) {
    return 'Selection is required.'
  }

  const num = Number(value)

  if (!Number.isInteger(num) || num < 1) {
    return 'Invalid selection.'
  }

  return null
}

export function validateForceDisposition(value: string, { required }: { required: boolean }): string | null {
  if (!value) {
    return required ? 'Force disposition is required.' : null
  }

  const num = Number(value)

  if (!Number.isInteger(num) || num < 1) {
    return 'Invalid force disposition selection.'
  }

  return null
}

const VALID_SECONDARY_MODES: SecondaryMode[] = ['tactical', 'fixed']

export function validateSecondaryMode(value: string): string | null {
  if (!value) return null // optional field

  if (!VALID_SECONDARY_MODES.includes(value as SecondaryMode)) {
    return 'Secondary missions mode must be tactical or fixed.'
  }

  return null
}
