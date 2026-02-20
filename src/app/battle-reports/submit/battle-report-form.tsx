'use client'

import {
  type BattleReportFormState,
  validatePlayerId,
  validateFactionId,
  validateScore,
  validateOutcome,
  validateRounds,
  validateSelectId,
} from '@/modules/battle-report/validation'
import type { BattlePoints, Deployment, Mission } from '@/types/battle-report'
import type { Faction, ProfileFaction } from '@/types/faction'
import type { Profile } from '@/types/profile'
import { startTransition, useActionState, useMemo, useRef, useState } from 'react'
import { submitBattleReport } from './actions'

type BattleReportFormProps = {
  missions: Mission[]
  deployments: Deployment[]
  battlePoints: BattlePoints[]
  members: Profile[]
  factions: Faction[]
  memberFactions: ProfileFaction[]
}

export default function BattleReportForm({ missions, deployments, battlePoints, members, factions, memberFactions }: BattleReportFormProps) {
  const [state, formAction, pending] = useActionState<BattleReportFormState, FormData>(submitBattleReport, null)
  const formRef = useRef<HTMLFormElement>(null)
  const [attackerId, setAttackerId] = useState('')
  const [defenderId, setDefenderId] = useState('')

  const factionsByMember = useMemo(() => {
    const map: Record<string, Set<string>> = {}
    for (const pf of memberFactions) {
      if (!map[pf.profile_id]) map[pf.profile_id] = new Set()
      map[pf.profile_id].add(pf.faction_id)
    }
    return map
  }, [memberFactions])

  const attackerFactions = attackerId
    ? factions.filter((f) => factionsByMember[attackerId]?.has(f.id))
    : []

  const defenderFactions = defenderId
    ? factions.filter((f) => factionsByMember[defenderId]?.has(f.id))
    : []

  function handleSubmit(formData: FormData) {
    const fields = {
      attacker_id: (formData.get('attacker_id') as string) ?? '',
      attacker_faction_id: (formData.get('attacker_faction_id') as string) ?? '',
      attacker_score: (formData.get('attacker_score') as string) ?? '',
      attacker_outcome: (formData.get('attacker_outcome') as string) ?? '',
      defender_id: (formData.get('defender_id') as string) ?? '',
      defender_faction_id: (formData.get('defender_faction_id') as string) ?? '',
      defender_score: (formData.get('defender_score') as string) ?? '',
      defender_outcome: (formData.get('defender_outcome') as string) ?? '',
      mission_id: (formData.get('mission_id') as string) ?? '',
      deployment_id: (formData.get('deployment_id') as string) ?? '',
      battle_points_id: (formData.get('battle_points_id') as string) ?? '',
      rounds: (formData.get('rounds') as string) ?? '',
    }

    const hasError =
      validatePlayerId(fields.attacker_id) ||
      validateFactionId(fields.attacker_faction_id) ||
      validateScore(fields.attacker_score) ||
      validateOutcome(fields.attacker_outcome) ||
      validatePlayerId(fields.defender_id) ||
      validateFactionId(fields.defender_faction_id) ||
      validateScore(fields.defender_score) ||
      validateOutcome(fields.defender_outcome) ||
      validateSelectId(fields.mission_id) ||
      validateSelectId(fields.deployment_id) ||
      validateSelectId(fields.battle_points_id) ||
      validateRounds(fields.rounds)

    if (hasError) {
      formRef.current?.reportValidity()
      return
    }

    if (fields.attacker_id === fields.defender_id) {
      return
    }

    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <div className="card w-full max-w-2xl bg-base-200 shadow-xl">
      <div className="card-body gap-4">
        <h1 className="card-title text-2xl">Submit Battle Report</h1>
        <p className="text-base-content/70">Record the results of a Warhammer 40K game.</p>

        {state?.success && (
          <div role="alert" className="alert alert-success">
            <span>{state.success}</span>
          </div>
        )}

        {state?.error && (
          <div role="alert" className="alert alert-error">
            <span>{state.error}</span>
          </div>
        )}

        <form ref={formRef} action={handleSubmit} className="flex flex-col gap-6">
          {/* Attacker Section */}
          <div className="bg-base-300 rounded-box p-4">
            <h2 className="text-lg font-semibold mb-3">Attacker</h2>
            <fieldset className="fieldset">
              <label className="label" htmlFor="attacker_id">
                Player
              </label>
              <select id="attacker_id" name="attacker_id" className={`select select-bordered w-full ${state?.errors?.attacker_id ? 'select-error' : ''}`} required value={attackerId} onChange={(e) => setAttackerId(e.target.value)}>
                <option value="">Select player</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.display_name}
                  </option>
                ))}
              </select>
              {state?.errors?.attacker_id && <p className="mt-1 text-sm text-error">{state.errors.attacker_id}</p>}

              <label className="label" htmlFor="attacker_faction_id">
                Faction
              </label>
              <select id="attacker_faction_id" name="attacker_faction_id" className={`select select-bordered w-full ${state?.errors?.attacker_faction_id ? 'select-error' : ''}`} required disabled={!attackerId}>
                <option value="">{attackerId ? 'Select faction' : 'Select a player first'}</option>
                {attackerFactions.map((faction) => (
                  <option key={faction.id} value={faction.id}>
                    {faction.name}
                  </option>
                ))}
              </select>
              {state?.errors?.attacker_faction_id && <p className="mt-1 text-sm text-error">{state.errors.attacker_faction_id}</p>}

              <label className="label" htmlFor="attacker_score">
                Score
              </label>
              <input
                id="attacker_score"
                name="attacker_score"
                type="number"
                min={0}
                className={`input input-bordered w-full ${state?.errors?.attacker_score ? 'input-error' : ''}`}
                required
              />
              {state?.errors?.attacker_score && <p className="mt-1 text-sm text-error">{state.errors.attacker_score}</p>}

              <label className="label" htmlFor="attacker_outcome">
                Outcome
              </label>
              <select id="attacker_outcome" name="attacker_outcome" className={`select select-bordered w-full ${state?.errors?.attacker_outcome ? 'select-error' : ''}`} required>
                <option value="">Select outcome</option>
                <option value="win">Win</option>
                <option value="loss">Loss</option>
                <option value="draw">Draw</option>
              </select>
              {state?.errors?.attacker_outcome && <p className="mt-1 text-sm text-error">{state.errors.attacker_outcome}</p>}
            </fieldset>
          </div>

          {/* Defender Section */}
          <div className="bg-base-300 rounded-box p-4">
            <h2 className="text-lg font-semibold mb-3">Defender</h2>
            <fieldset className="fieldset">
              <label className="label" htmlFor="defender_id">
                Player
              </label>
              <select id="defender_id" name="defender_id" className={`select select-bordered w-full ${state?.errors?.defender_id ? 'select-error' : ''}`} required value={defenderId} onChange={(e) => setDefenderId(e.target.value)}>
                <option value="">Select player</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.display_name}
                  </option>
                ))}
              </select>
              {state?.errors?.defender_id && <p className="mt-1 text-sm text-error">{state.errors.defender_id}</p>}

              <label className="label" htmlFor="defender_faction_id">
                Faction
              </label>
              <select id="defender_faction_id" name="defender_faction_id" className={`select select-bordered w-full ${state?.errors?.defender_faction_id ? 'select-error' : ''}`} required disabled={!defenderId}>
                <option value="">{defenderId ? 'Select faction' : 'Select a player first'}</option>
                {defenderFactions.map((faction) => (
                  <option key={faction.id} value={faction.id}>
                    {faction.name}
                  </option>
                ))}
              </select>
              {state?.errors?.defender_faction_id && <p className="mt-1 text-sm text-error">{state.errors.defender_faction_id}</p>}

              <label className="label" htmlFor="defender_score">
                Score
              </label>
              <input
                id="defender_score"
                name="defender_score"
                type="number"
                min={0}
                className={`input input-bordered w-full ${state?.errors?.defender_score ? 'input-error' : ''}`}
                required
              />
              {state?.errors?.defender_score && <p className="mt-1 text-sm text-error">{state.errors.defender_score}</p>}

              <label className="label" htmlFor="defender_outcome">
                Outcome
              </label>
              <select id="defender_outcome" name="defender_outcome" className={`select select-bordered w-full ${state?.errors?.defender_outcome ? 'select-error' : ''}`} required>
                <option value="">Select outcome</option>
                <option value="win">Win</option>
                <option value="loss">Loss</option>
                <option value="draw">Draw</option>
              </select>
              {state?.errors?.defender_outcome && <p className="mt-1 text-sm text-error">{state.errors.defender_outcome}</p>}
            </fieldset>
          </div>

          {/* Game Details Section */}
          <div className="bg-base-300 rounded-box p-4">
            <h2 className="text-lg font-semibold mb-3">Game Details</h2>
            <fieldset className="fieldset">
              <label className="label" htmlFor="mission_id">
                Mission
              </label>
              <select id="mission_id" name="mission_id" className={`select select-bordered w-full ${state?.errors?.mission_id ? 'select-error' : ''}`} required>
                <option value="">Select mission</option>
                {missions.map((mission) => (
                  <option key={mission.id} value={mission.id}>
                    {mission.name}
                  </option>
                ))}
              </select>
              {state?.errors?.mission_id && <p className="mt-1 text-sm text-error">{state.errors.mission_id}</p>}

              <label className="label" htmlFor="deployment_id">
                Deployment
              </label>
              <select id="deployment_id" name="deployment_id" className={`select select-bordered w-full ${state?.errors?.deployment_id ? 'select-error' : ''}`} required>
                <option value="">Select deployment</option>
                {deployments.map((deployment) => (
                  <option key={deployment.id} value={deployment.id}>
                    {deployment.name}
                  </option>
                ))}
              </select>
              {state?.errors?.deployment_id && <p className="mt-1 text-sm text-error">{state.errors.deployment_id}</p>}

              <label className="label" htmlFor="battle_points_id">
                Battle Size
              </label>
              <select id="battle_points_id" name="battle_points_id" className={`select select-bordered w-full ${state?.errors?.battle_points_id ? 'select-error' : ''}`} required>
                <option value="">Select battle size</option>
                {battlePoints.map((bp) => (
                  <option key={bp.id} value={bp.id}>
                    {bp.name} ({bp.size} pts)
                  </option>
                ))}
              </select>
              {state?.errors?.battle_points_id && <p className="mt-1 text-sm text-error">{state.errors.battle_points_id}</p>}

              <label className="label" htmlFor="rounds">
                Rounds Played
              </label>
              <input
                id="rounds"
                name="rounds"
                type="number"
                min={1}
                max={5}
                className={`input input-bordered w-full ${state?.errors?.rounds ? 'input-error' : ''}`}
                required
              />
              {state?.errors?.rounds && <p className="mt-1 text-sm text-error">{state.errors.rounds}</p>}
            </fieldset>
          </div>

          <button type="submit" className="btn btn-success w-full" disabled={pending}>
            {pending ? <span className="loading loading-spinner loading-sm" /> : 'Submit Battle Report'}
          </button>
        </form>
      </div>
    </div>
  )
}
