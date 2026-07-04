import type { BattleReport, Mission } from '@/types/battle-report'

type DispositionPair = Pick<
  BattleReport,
  'attacker_force_disposition_id' | 'defender_force_disposition_id'
>

/**
 * Derives each player's primary mission from the force disposition matchup.
 * A mission row maps (force_disposition, opponent_force_disposition) — the
 * attacker plays the row keyed by their disposition vs the defender's, and
 * vice versa. Either side may resolve to null on misconfigured edition data.
 */
export function resolvePrimaryMissions(
  report: DispositionPair,
  missions: Mission[],
): { attackerPrimary: Mission | null; defenderPrimary: Mission | null } {
  const attackerId = report.attacker_force_disposition_id
  const defenderId = report.defender_force_disposition_id

  if (attackerId == null || defenderId == null) {
    return { attackerPrimary: null, defenderPrimary: null }
  }

  return {
    attackerPrimary:
      missions.find(
        (m) => m.force_disposition_id === attackerId && m.opponent_force_disposition_id === defenderId,
      ) ?? null,
    defenderPrimary:
      missions.find(
        (m) => m.force_disposition_id === defenderId && m.opponent_force_disposition_id === attackerId,
      ) ?? null,
  }
}

/**
 * One-line pairing label for list surfaces: a single name for mirror
 * matchups, "A vs B" otherwise. Null when neither side resolved.
 */
export function formatPrimaryMissionPairing(
  attackerPrimary: Mission | null,
  defenderPrimary: Mission | null,
): string | null {
  if (!attackerPrimary && !defenderPrimary) return null
  if (attackerPrimary && defenderPrimary && attackerPrimary.id === defenderPrimary.id) {
    return attackerPrimary.name
  }
  return `${attackerPrimary?.name ?? '—'} vs ${defenderPrimary?.name ?? '—'}`
}
