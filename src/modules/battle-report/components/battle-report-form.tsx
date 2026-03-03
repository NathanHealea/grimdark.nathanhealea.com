'use client'

import {
  type BattleReportFormState,
  validateEventDate,
  validateFactionId,
  validateOutcome,
  validatePlayerId,
  validateRounds,
  validateScore,
  validateSeasonId,
  validateSelectId,
} from '@/modules/battle-report/validation'
import type { BattlePoints, BattleReport, Deployment, Mission } from '@/types/battle-report'
import type { Faction, ProfileFaction } from '@/types/faction'
import type { Profile } from '@/types/profile'
import { formatSeasonName, isCurrentSeason, isPastSeason, type Season } from '@/types/season'
import { startTransition, useActionState, useEffect, useMemo, useRef, useState } from 'react'
import { updateBattleReport } from '@/app/battle-reports/[id]/edit/actions'
import { submitBattleReport } from '@/app/battle-reports/submit/actions'

type BattleReportFormProps = {
  missions: Mission[]
  deployments: Deployment[]
  battlePoints: BattlePoints[]
  members: Profile[]
  factions: Faction[]
  memberFactions: ProfileFaction[]
  seasons: Season[]
  isAdmin: boolean
  defaultValues?: Partial<BattleReport>
  reportId?: string
}

function toFormValues(defaults?: Partial<BattleReport>) {
  return {
    event_date: defaults?.event_date ?? '',
    attacker_id: defaults?.attacker_id ?? '',
    attacker_faction_id: defaults?.attacker_faction_id ?? '',
    attacker_score: defaults?.attacker_score != null ? String(defaults.attacker_score) : '',
    attacker_outcome: defaults?.attacker_outcome ?? '',
    defender_id: defaults?.defender_id ?? '',
    defender_faction_id: defaults?.defender_faction_id ?? '',
    defender_score: defaults?.defender_score != null ? String(defaults.defender_score) : '',
    defender_outcome: defaults?.defender_outcome ?? '',
    mission_id: defaults?.mission_id != null ? String(defaults.mission_id) : '',
    deployment_id: defaults?.deployment_id != null ? String(defaults.deployment_id) : '',
    battle_points_id: defaults?.battle_points_id != null ? String(defaults.battle_points_id) : '',
    rounds: defaults?.rounds != null ? String(defaults.rounds) : '',
    season_id: defaults?.season_id != null ? String(defaults.season_id) : '',
    attacker_tabled: defaults?.attacker_tabled ?? false,
    defender_tabled: defaults?.defender_tabled ?? false,
  }
}

export default function BattleReportForm({
  missions,
  deployments,
  battlePoints,
  members,
  factions,
  memberFactions,
  seasons,
  isAdmin,
  defaultValues,
  reportId,
}: BattleReportFormProps) {
  const isEditMode = !!reportId
  const statusLocked = isEditMode && defaultValues?.status === 'published' && !isAdmin
  const action = isEditMode
    ? (prev: BattleReportFormState, formData: FormData) => updateBattleReport(reportId, prev, formData)
    : submitBattleReport

  const [state, formAction, pending] = useActionState<BattleReportFormState, FormData>(action, null)
  const formRef = useRef<HTMLFormElement>(null)
  const [values, setValues] = useState(() => toFormValues(defaultValues))
  const [status, setStatus] = useState<'draft' | 'published'>(defaultValues?.status ?? 'draft')
  const [samePlayerError, setSamePlayerError] = useState('')

  // Reset form on successful submit — useActionState requires useEffect for state observation
  useEffect(() => {
    if (state?.success && !isEditMode) {
      setValues(toFormValues()) // eslint-disable-line react-hooks/set-state-in-effect
      setStatus('draft')
      setSamePlayerError('')
    }
  }, [state, isEditMode])

  function updateField(name: keyof ReturnType<typeof toFormValues>, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

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

  const visibleSeasons = useMemo(() => {
    if (isAdmin) return seasons
    return seasons.filter((s) => isCurrentSeason(s))
  }, [seasons, isAdmin])

  function handleSubmit(formData: FormData) {
    formData.set('status', status)

    // Only validate for published reports
    if (status === 'published') {
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
        validateRounds(values.rounds) ||
        validateSeasonId(values.season_id)

      if (hasError) {
        formRef.current?.reportValidity()
        return
      }

      if (values.attacker_id && values.attacker_id === values.defender_id) {
        setSamePlayerError('Attacker and defender cannot be the same player.')
        return
      }
    }

    setSamePlayerError('')

    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <>
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
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(new FormData(e.currentTarget))
        }}
        className="flex flex-col gap-6"
      >
        {/* Game Details Section */}
        <div>
          <h2 className="ornament section-header">Game Details</h2>
          <fieldset className="form-section">
            <div className="form-grid">
              <div>
                <label className="label" htmlFor="event_date">
                  Date of Battle
                </label>
                <input
                  id="event_date"
                  name="event_date"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  className={`input input-lg input-bordered w-full ${state?.errors?.event_date ? 'input-error' : ''}`}
                  value={values.event_date}
                  onChange={(e) => updateField('event_date', e.target.value)}
                />
                {state?.errors?.event_date && <p className="form-error">{state.errors.event_date}</p>}
              </div>
              <div>
                <label className="label" htmlFor="season_id">
                  Season
                </label>
                <select
                  id="season_id"
                  name="season_id"
                  className={`select select-lg select-bordered w-full ${state?.errors?.season_id ? 'select-error' : ''}`}
                  value={values.season_id}
                  onChange={(e) => updateField('season_id', e.target.value)}
                >
                  <option value="">No season</option>
                  {visibleSeasons.map((season) => (
                    <option key={season.id} value={season.id}>
                      {formatSeasonName(season)}
                      {isPastSeason(season) ? ' (past)' : ''}
                    </option>
                  ))}
                </select>
                {state?.errors?.season_id && <p className="form-error">{state.errors.season_id}</p>}
              </div>
            </div>

            <div className="form-grid mt-1">
              <div>
                <label className="label" htmlFor="mission_id">
                  Mission
                </label>
                <select
                  id="mission_id"
                  name="mission_id"
                  className={`select select-lg select-bordered w-full ${state?.errors?.mission_id ? 'select-error' : ''}`}
                  value={values.mission_id}
                  onChange={(e) => updateField('mission_id', e.target.value)}
                >
                  <option value="">Select mission</option>
                  {missions.map((mission) => (
                    <option key={mission.id} value={mission.id}>
                      {mission.name}
                    </option>
                  ))}
                </select>
                {state?.errors?.mission_id && <p className="form-error">{state.errors.mission_id}</p>}
              </div>
              <div>
                <label className="label" htmlFor="deployment_id">
                  Deployment
                </label>
                <select
                  id="deployment_id"
                  name="deployment_id"
                  className={`select select-lg select-bordered w-full ${state?.errors?.deployment_id ? 'select-error' : ''}`}
                  value={values.deployment_id}
                  onChange={(e) => updateField('deployment_id', e.target.value)}
                >
                  <option value="">Select deployment</option>
                  {deployments.map((deployment) => (
                    <option key={deployment.id} value={deployment.id}>
                      {deployment.name}
                    </option>
                  ))}
                </select>
                {state?.errors?.deployment_id && (
                  <p className="form-error">{state.errors.deployment_id}</p>
                )}
              </div>
            </div>

            <div className="form-grid mt-1">
              <div>
                <label className="label" htmlFor="battle_points_id">
                  Battle Size
                </label>
                <select
                  id="battle_points_id"
                  name="battle_points_id"
                  className={`select select-lg select-bordered w-full ${state?.errors?.battle_points_id ? 'select-error' : ''}`}
                  value={values.battle_points_id}
                  onChange={(e) => updateField('battle_points_id', e.target.value)}
                >
                  <option value="">Select battle size</option>
                  {battlePoints.map((bp) => (
                    <option key={bp.id} value={bp.id}>
                      {bp.name} ({bp.size} pts)
                    </option>
                  ))}
                </select>
                {state?.errors?.battle_points_id && (
                  <p className="form-error">{state.errors.battle_points_id}</p>
                )}
              </div>
              <div>
                <label className="label" htmlFor="rounds">
                  Rounds Played
                </label>
                <select
                  id="rounds"
                  name="rounds"
                  className={`select select-lg select-bordered w-full ${state?.errors?.rounds ? 'select-error' : ''}`}
                  value={values.rounds}
                  onChange={(e) => updateField('rounds', e.target.value)}
                >
                  <option value="">Select rounds</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                {state?.errors?.rounds && <p className="form-error">{state.errors.rounds}</p>}
              </div>
            </div>
          </fieldset>
        </div>

        {/* Attacker Section */}
        <div>
          <h2 className="ornament section-header">Attacker</h2>
          <fieldset className="form-section">
            <div className="form-grid">
              <div>
                <label className="label" htmlFor="attacker_id">
                  Player
                </label>
                <select
                  id="attacker_id"
                  name="attacker_id"
                  className={`select select-lg select-bordered w-full ${state?.errors?.attacker_id ? 'select-error' : ''}`}
                  value={values.attacker_id}
                  onChange={(e) => {
                    updateField('attacker_id', e.target.value)
                    updateField('attacker_faction_id', '')
                    setSamePlayerError('')
                  }}
                >
                  <option value="">Select player</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.display_name}
                    </option>
                  ))}
                </select>
                {state?.errors?.attacker_id && <p className="form-error">{state.errors.attacker_id}</p>}
              </div>
              <div>
                <label className="label" htmlFor="attacker_faction_id">
                  Faction
                </label>
                <select
                  id="attacker_faction_id"
                  name="attacker_faction_id"
                  className={`select select-lg select-bordered w-full ${state?.errors?.attacker_faction_id ? 'select-error' : ''}`}
                  disabled={!values.attacker_id}
                  value={values.attacker_faction_id}
                  onChange={(e) => updateField('attacker_faction_id', e.target.value)}
                >
                  <option value="">{values.attacker_id ? 'Select faction' : 'Select a player first'}</option>
                  {attackerFactions.map((faction) => (
                    <option key={faction.id} value={faction.id}>
                      {faction.name}
                    </option>
                  ))}
                </select>
                {state?.errors?.attacker_faction_id && (
                  <p className="form-error">{state.errors.attacker_faction_id}</p>
                )}
              </div>
            </div>

            <div className="form-grid mt-1">
              <div>
                <label className="label" htmlFor="attacker_score">
                  Score
                </label>
                <input
                  id="attacker_score"
                  name="attacker_score"
                  type="number"
                  min={0}
                  className={`input input-lg input-bordered w-full ${state?.errors?.attacker_score ? 'input-error' : ''}`}
                  value={values.attacker_score}
                  onChange={(e) => updateField('attacker_score', e.target.value)}
                />
                {state?.errors?.attacker_score && (
                  <p className="form-error">{state.errors.attacker_score}</p>
                )}
              </div>
              <div>
                <label className="label" htmlFor="attacker_outcome">
                  Outcome
                </label>
                <select
                  id="attacker_outcome"
                  name="attacker_outcome"
                  className={`select select-lg select-bordered w-full ${state?.errors?.attacker_outcome ? 'select-error' : ''}`}
                  value={values.attacker_outcome}
                  onChange={(e) => updateField('attacker_outcome', e.target.value)}
                >
                  <option value="">Select outcome</option>
                  <option value="win">Win</option>
                  <option value="loss">Loss</option>
                  <option value="draw">Draw</option>
                </select>
                {state?.errors?.attacker_outcome && (
                  <p className="form-error">{state.errors.attacker_outcome}</p>
                )}
              </div>
            </div>

            <div className="mt-1">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  name="attacker_tabled"
                  className="checkbox"
                  checked={values.attacker_tabled}
                  onChange={(e) => setValues((prev) => ({ ...prev, attacker_tabled: e.target.checked }))}
                />
                <span>
                  Tabled <span className="text-sm text-base-content/50">— All units destroyed</span>
                </span>
              </label>
            </div>
          </fieldset>
        </div>

        {/* Defender Section */}
        <div>
          <h2 className="ornament section-header">Defender</h2>
          <fieldset className="form-section">
            <div className="form-grid">
              <div>
                <label className="label" htmlFor="defender_id">
                  Player
                </label>
                <select
                  id="defender_id"
                  name="defender_id"
                  className={`select select-lg select-bordered w-full ${state?.errors?.defender_id || samePlayerError ? 'select-error' : ''}`}
                  value={values.defender_id}
                  onChange={(e) => {
                    updateField('defender_id', e.target.value)
                    updateField('defender_faction_id', '')
                    setSamePlayerError('')
                  }}
                >
                  <option value="">Select player</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.display_name}
                    </option>
                  ))}
                </select>
                {(state?.errors?.defender_id || samePlayerError) && (
                  <p className="form-error">{state?.errors?.defender_id || samePlayerError}</p>
                )}
              </div>
              <div>
                <label className="label" htmlFor="defender_faction_id">
                  Faction
                </label>
                <select
                  id="defender_faction_id"
                  name="defender_faction_id"
                  className={`select select-lg select-bordered w-full ${state?.errors?.defender_faction_id ? 'select-error' : ''}`}
                  disabled={!values.defender_id}
                  value={values.defender_faction_id}
                  onChange={(e) => updateField('defender_faction_id', e.target.value)}
                >
                  <option value="">{values.defender_id ? 'Select faction' : 'Select a player first'}</option>
                  {defenderFactions.map((faction) => (
                    <option key={faction.id} value={faction.id}>
                      {faction.name}
                    </option>
                  ))}
                </select>
                {state?.errors?.defender_faction_id && (
                  <p className="form-error">{state.errors.defender_faction_id}</p>
                )}
              </div>
            </div>

            <div className="form-grid mt-1">
              <div>
                <label className="label" htmlFor="defender_score">
                  Score
                </label>
                <input
                  id="defender_score"
                  name="defender_score"
                  type="number"
                  min={0}
                  className={`input input-lg input-bordered w-full ${state?.errors?.defender_score ? 'input-error' : ''}`}
                  value={values.defender_score}
                  onChange={(e) => updateField('defender_score', e.target.value)}
                />
                {state?.errors?.defender_score && (
                  <p className="form-error">{state.errors.defender_score}</p>
                )}
              </div>
              <div>
                <label className="label" htmlFor="defender_outcome">
                  Outcome
                </label>
                <select
                  id="defender_outcome"
                  name="defender_outcome"
                  className={`select select-lg select-bordered w-full ${state?.errors?.defender_outcome ? 'select-error' : ''}`}
                  value={values.defender_outcome}
                  onChange={(e) => updateField('defender_outcome', e.target.value)}
                >
                  <option value="">Select outcome</option>
                  <option value="win">Win</option>
                  <option value="loss">Loss</option>
                  <option value="draw">Draw</option>
                </select>
                {state?.errors?.defender_outcome && (
                  <p className="form-error">{state.errors.defender_outcome}</p>
                )}
              </div>
            </div>

            <div className="mt-1">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  name="defender_tabled"
                  className="checkbox"
                  checked={values.defender_tabled}
                  onChange={(e) => setValues((prev) => ({ ...prev, defender_tabled: e.target.checked }))}
                />
                <span>
                  Tabled <span className="text-sm text-base-content/50">— All units destroyed</span>
                </span>
              </label>
            </div>
          </fieldset>
        </div>

        {/* Status & Save */}
        <div>
          <h2 className="ornament section-header">Reporting</h2>
          <fieldset className="form-section">
            <label className="label" htmlFor="status">
              Report Status
            </label>
            <select
              id="status"
              name="status"
              className={`select select-lg select-bordered w-full ${state?.errors?.status ? 'select-error' : ''}`}
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              disabled={statusLocked}
            >
              <option value="draft">Draft</option>
              <option value="published">Publish</option>
            </select>
            {state?.errors?.status && <p className="form-error">{state.errors.status}</p>}
            <p className="mt-2 text-sm text-base-content/50">
              {statusLocked
                ? 'Published reports cannot be reverted to draft. Contact an organizer or admin if needed.'
                : status === 'draft'
                  ? 'Save as a draft to finish later. Drafts reports will only be visible to you/organizers/admins and will not update stats.'
                  : 'Publish this report. Report will be visible to all members and update stats.'}
            </p>
          </fieldset>
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={pending}>
          {pending ? (
            <span className="loading loading-spinner loading-md" />
          ) : isEditMode ? (
            'Update Report'
          ) : (
            'Submit Report'
          )}
        </button>
      </form>
    </>
  )
}
