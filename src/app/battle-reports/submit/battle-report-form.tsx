'use client'

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
import type { BattlePoints, Deployment, Mission } from '@/types/battle-report'
import type { Faction, ProfileFaction } from '@/types/faction'
import type { Profile } from '@/types/profile'
import { startTransition, useActionState, useEffect, useMemo, useRef, useState } from 'react'
import { submitBattleReport } from './actions'

type BattleReportFormProps = {
  missions: Mission[]
  deployments: Deployment[]
  battlePoints: BattlePoints[]
  members: Profile[]
  factions: Faction[]
  memberFactions: ProfileFaction[]
}

const initialValues = {
  event_date: '',
  attacker_id: '',
  attacker_faction_id: '',
  attacker_score: '',
  attacker_outcome: '',
  defender_id: '',
  defender_faction_id: '',
  defender_score: '',
  defender_outcome: '',
  mission_id: '',
  deployment_id: '',
  battle_points_id: '',
  rounds: '',
}

export default function BattleReportForm({ missions, deployments, battlePoints, members, factions, memberFactions }: BattleReportFormProps) {
  const [state, formAction, pending] = useActionState<BattleReportFormState, FormData>(submitBattleReport, null)
  const formRef = useRef<HTMLFormElement>(null)
  const [values, setValues] = useState(initialValues)
  const [samePlayerError, setSamePlayerError] = useState('')

  function updateField(name: keyof typeof initialValues, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    if (state?.success) {
      setValues(initialValues)
      setSamePlayerError('')
    }
  }, [state])

  const factionsByMember = useMemo(() => {
    const map: Record<string, Set<string>> = {}
    for (const pf of memberFactions) {
      if (!map[pf.profile_id]) map[pf.profile_id] = new Set()
      map[pf.profile_id].add(pf.faction_id)
    }
    return map
  }, [memberFactions])

  const attackerFactions = values.attacker_id
    ? factions.filter((f) => factionsByMember[values.attacker_id]?.has(f.id))
    : []

  const defenderFactions = values.defender_id
    ? factions.filter((f) => factionsByMember[values.defender_id]?.has(f.id))
    : []

  function handleSubmit(formData: FormData) {
    const hasError =
      validateEventDate(values.event_date) ||
      validatePlayerId(values.attacker_id) ||
      validateFactionId(values.attacker_faction_id) ||
      validateScore(values.attacker_score) ||
      validateOutcome(values.attacker_outcome) ||
      validatePlayerId(values.defender_id) ||
      validateFactionId(values.defender_faction_id) ||
      validateScore(values.defender_score) ||
      validateOutcome(values.defender_outcome) ||
      validateSelectId(values.mission_id) ||
      validateSelectId(values.deployment_id) ||
      validateSelectId(values.battle_points_id) ||
      validateRounds(values.rounds)

    if (hasError) {
      formRef.current?.reportValidity()
      return
    }

    if (values.attacker_id && values.attacker_id === values.defender_id) {
      setSamePlayerError('Attacker and defender cannot be the same player.')
      return
    }

    setSamePlayerError('')

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

        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)) }} className="flex flex-col gap-6">
          {/* Game Details Section */}
          <div className="bg-base-300 rounded-box p-4">
            <h2 className="text-lg font-semibold mb-3">Game Details</h2>
            <fieldset className="fieldset">
              <label className="label" htmlFor="event_date">
                Date of Battle
              </label>
              <input
                id="event_date"
                name="event_date"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                className={`input input-bordered w-full ${state?.errors?.event_date ? 'input-error' : ''}`}
                required
                value={values.event_date}
                onChange={(e) => updateField('event_date', e.target.value)}
              />
              {state?.errors?.event_date && <p className="mt-1 text-sm text-error">{state.errors.event_date}</p>}

              <label className="label" htmlFor="mission_id">
                Mission
              </label>
              <select id="mission_id" name="mission_id" className={`select select-bordered w-full ${state?.errors?.mission_id ? 'select-error' : ''}`} required value={values.mission_id} onChange={(e) => updateField('mission_id', e.target.value)}>
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
              <select id="deployment_id" name="deployment_id" className={`select select-bordered w-full ${state?.errors?.deployment_id ? 'select-error' : ''}`} required value={values.deployment_id} onChange={(e) => updateField('deployment_id', e.target.value)}>
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
              <select id="battle_points_id" name="battle_points_id" className={`select select-bordered w-full ${state?.errors?.battle_points_id ? 'select-error' : ''}`} required value={values.battle_points_id} onChange={(e) => updateField('battle_points_id', e.target.value)}>
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
              <select id="rounds" name="rounds" className={`select select-bordered w-full ${state?.errors?.rounds ? 'select-error' : ''}`} required value={values.rounds} onChange={(e) => updateField('rounds', e.target.value)}>
                <option value="">Select rounds</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
              {state?.errors?.rounds && <p className="mt-1 text-sm text-error">{state.errors.rounds}</p>}
            </fieldset>
          </div>

          {/* Attacker Section */}
          <div className="bg-base-300 rounded-box p-4">
            <h2 className="text-lg font-semibold mb-3">Attacker</h2>
            <fieldset className="fieldset">
              <label className="label" htmlFor="attacker_id">
                Player
              </label>
              <select id="attacker_id" name="attacker_id" className={`select select-bordered w-full ${state?.errors?.attacker_id ? 'select-error' : ''}`} required value={values.attacker_id} onChange={(e) => { updateField('attacker_id', e.target.value); updateField('attacker_faction_id', ''); setSamePlayerError('') }}>
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
              <select id="attacker_faction_id" name="attacker_faction_id" className={`select select-bordered w-full ${state?.errors?.attacker_faction_id ? 'select-error' : ''}`} required disabled={!values.attacker_id} value={values.attacker_faction_id} onChange={(e) => updateField('attacker_faction_id', e.target.value)}>
                <option value="">{values.attacker_id ? 'Select faction' : 'Select a player first'}</option>
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
                value={values.attacker_score}
                onChange={(e) => updateField('attacker_score', e.target.value)}
              />
              {state?.errors?.attacker_score && <p className="mt-1 text-sm text-error">{state.errors.attacker_score}</p>}

              <label className="label" htmlFor="attacker_outcome">
                Outcome
              </label>
              <select id="attacker_outcome" name="attacker_outcome" className={`select select-bordered w-full ${state?.errors?.attacker_outcome ? 'select-error' : ''}`} required value={values.attacker_outcome} onChange={(e) => updateField('attacker_outcome', e.target.value)}>
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
              <select id="defender_id" name="defender_id" className={`select select-bordered w-full ${state?.errors?.defender_id || samePlayerError ? 'select-error' : ''}`} required value={values.defender_id} onChange={(e) => { updateField('defender_id', e.target.value); updateField('defender_faction_id', ''); setSamePlayerError('') }}>
                <option value="">Select player</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.display_name}
                  </option>
                ))}
              </select>
              {(state?.errors?.defender_id || samePlayerError) && <p className="mt-1 text-sm text-error">{state?.errors?.defender_id || samePlayerError}</p>}

              <label className="label" htmlFor="defender_faction_id">
                Faction
              </label>
              <select id="defender_faction_id" name="defender_faction_id" className={`select select-bordered w-full ${state?.errors?.defender_faction_id ? 'select-error' : ''}`} required disabled={!values.defender_id} value={values.defender_faction_id} onChange={(e) => updateField('defender_faction_id', e.target.value)}>
                <option value="">{values.defender_id ? 'Select faction' : 'Select a player first'}</option>
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
                value={values.defender_score}
                onChange={(e) => updateField('defender_score', e.target.value)}
              />
              {state?.errors?.defender_score && <p className="mt-1 text-sm text-error">{state.errors.defender_score}</p>}

              <label className="label" htmlFor="defender_outcome">
                Outcome
              </label>
              <select id="defender_outcome" name="defender_outcome" className={`select select-bordered w-full ${state?.errors?.defender_outcome ? 'select-error' : ''}`} required value={values.defender_outcome} onChange={(e) => updateField('defender_outcome', e.target.value)}>
                <option value="">Select outcome</option>
                <option value="win">Win</option>
                <option value="loss">Loss</option>
                <option value="draw">Draw</option>
              </select>
              {state?.errors?.defender_outcome && <p className="mt-1 text-sm text-error">{state.errors.defender_outcome}</p>}
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
