'use client'

import {
  type BattleReportFormState,
  validateEventDate,
  validateFactionId,
  validateForceDisposition,
  validateOutcome,
  validatePlayerId,
  validateRounds,
  validateScore,
  validateSeasonId,
  validateSecondaryMode,
  validateSelectId,
  validateEditionId,
} from '@/modules/battle-report/validation'
import type { BattlePoints, BattleReport, Deployment, Mission, RoundStatFormValues } from '@/types/battle-report'
import type { Edition } from '@/types/edition'
import type { ForceDisposition } from '@/types/force-disposition'
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
  defaultRoundStats?: RoundStatFormValues[]
  reportId?: string
  // Edition-related props
  publishedEditions: Edition[]
  defaultEditionId: number | null
  missionsByEdition: Record<number, Mission[]>
  deploymentsByEdition: Record<number, Deployment[]>
  dispositionsByEdition: Record<number, ForceDisposition[]>
}

function toFormValues(defaults?: Partial<BattleReport>, defaultEditionId?: number | null) {
  return {
    event_date: defaults?.event_date ?? '',
    attacker_id: defaults?.attacker_id ?? '',
    attacker_faction_id: defaults?.attacker_faction_id ?? '',
    attacker_score: defaults?.attacker_score != null ? String(defaults.attacker_score) : '0',
    attacker_outcome: defaults?.attacker_outcome ?? '',
    defender_id: defaults?.defender_id ?? '',
    defender_faction_id: defaults?.defender_faction_id ?? '',
    defender_score: defaults?.defender_score != null ? String(defaults.defender_score) : '0',
    defender_outcome: defaults?.defender_outcome ?? '',
    edition_id: defaults?.edition_id != null ? String(defaults.edition_id) : (defaultEditionId != null ? String(defaultEditionId) : ''),
    mission_id: defaults?.mission_id != null ? String(defaults.mission_id) : '',
    attacker_force_disposition_id: defaults?.attacker_force_disposition_id != null ? String(defaults.attacker_force_disposition_id) : '',
    defender_force_disposition_id: defaults?.defender_force_disposition_id != null ? String(defaults.defender_force_disposition_id) : '',
    attacker_secondary_mode: defaults?.attacker_secondary_mode ?? '',
    defender_secondary_mode: defaults?.defender_secondary_mode ?? '',
    deployment_id: defaults?.deployment_id != null ? String(defaults.deployment_id) : '',
    battle_points_id: defaults?.battle_points_id != null ? String(defaults.battle_points_id) : '',
    rounds: defaults?.rounds != null ? String(defaults.rounds) : '',
    season_id: defaults?.season_id != null ? String(defaults.season_id) : '',
    attacker_tabled: defaults?.attacker_tabled ?? false,
    defender_tabled: defaults?.defender_tabled ?? false,
    attacker_units_lost: defaults?.attacker_units_lost != null ? String(defaults.attacker_units_lost) : '0',
    attacker_models_lost: defaults?.attacker_models_lost != null ? String(defaults.attacker_models_lost) : '0',
    defender_units_lost: defaults?.defender_units_lost != null ? String(defaults.defender_units_lost) : '0',
    defender_models_lost: defaults?.defender_models_lost != null ? String(defaults.defender_models_lost) : '0',
  }
}

function validateFieldByName(name: string, value: string): string | null {
  switch (name) {
    case 'event_date': return validateEventDate(value)
    case 'attacker_id':
    case 'defender_id': return validatePlayerId(value)
    case 'attacker_faction_id':
    case 'defender_faction_id': return validateFactionId(value)
    case 'attacker_score':
    case 'defender_score': return validateScore(value)
    case 'attacker_outcome':
    case 'defender_outcome': return validateOutcome(value)
    case 'edition_id': return validateEditionId(value)
    case 'attacker_force_disposition_id':
    case 'defender_force_disposition_id': return validateForceDisposition(value, { required: true })
    case 'attacker_secondary_mode':
    case 'defender_secondary_mode': return validateSecondaryMode(value)
    case 'mission_id':
    case 'deployment_id':
    case 'battle_points_id': return validateSelectId(value)
    case 'rounds': return validateRounds(value)
    case 'season_id': return validateSeasonId(value)
    default: return null
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
  defaultRoundStats,
  reportId,
  publishedEditions,
  defaultEditionId,
  missionsByEdition,
  deploymentsByEdition,
  dispositionsByEdition,
}: BattleReportFormProps) {
  const isEditMode = !!reportId
  const statusLocked = isEditMode && defaultValues?.status === 'published' && !isAdmin
  const action = isEditMode
    ? (prev: BattleReportFormState, formData: FormData) => updateBattleReport(reportId, prev, formData)
    : submitBattleReport

  const [state, formAction, pending] = useActionState<BattleReportFormState, FormData>(action, null)
  const formRef = useRef<HTMLFormElement>(null)
  const [values, setValues] = useState(() => toFormValues(defaultValues, defaultEditionId))
  const [status, setStatus] = useState<'draft' | 'published'>(defaultValues?.status ?? 'draft')
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})
  const [resolvedFields, setResolvedFields] = useState<Set<string>>(new Set())
  const [roundStats, setRoundStats] = useState<RoundStatFormValues[]>(defaultRoundStats ?? [])
  const [editionClearedNote, setEditionClearedNote] = useState<string | null>(null)

  function fieldError(key: string): string | undefined {
    return clientErrors[key] || (state?.errors as Record<string, string> | undefined)?.[key]
  }

  function fieldSuccess(key: string): boolean {
    return resolvedFields.has(key) && !fieldError(key)
  }

  function createEmptyRound(roundNumber: number): RoundStatFormValues {
    return {
      round_number: roundNumber,
      attacker_points_earned: '0',
      attacker_units_lost: '0',
      attacker_models_lost: '0',
      defender_points_earned: '0',
      defender_units_lost: '0',
      defender_models_lost: '0',
    }
  }

  function addRound() {
    if (roundStats.length >= 5) return
    setRoundStats((prev) => [...prev, createEmptyRound(prev.length + 1)])
  }

  function removeRound(index: number) {
    setRoundStats((prev) => prev.filter((_, i) => i !== index).map((r, i) => ({ ...r, round_number: i + 1 })))
  }

  function updateRoundStat(index: number, field: keyof RoundStatFormValues, value: string) {
    setRoundStats((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
  }

  // Reset form on successful submit — useActionState requires useEffect for state observation
  useEffect(() => {
    if (state?.success && !isEditMode) {
      setValues(toFormValues(undefined, defaultEditionId)) // eslint-disable-line react-hooks/set-state-in-effect
      setStatus('draft')
      setClientErrors({})
      setResolvedFields(new Set())
      setRoundStats([])
      setEditionClearedNote(null)
    }
  }, [state, isEditMode, defaultEditionId])

  function updateField(name: keyof ReturnType<typeof toFormValues>, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }))

    const serverErrors = state?.errors as Record<string, string> | undefined
    const hasError = !!clientErrors[name] || !!serverErrors?.[name]
    const wasResolved = resolvedFields.has(name)

    if (hasError || wasResolved) {
      let error = validateFieldByName(name, value)

      if (!error && name === 'defender_id' && value && value === values.attacker_id) {
        error = 'Attacker and defender cannot be the same player.'
      }

      if (!error) {
        setClientErrors((prev) => { const next = { ...prev }; delete next[name]; return next })
        setResolvedFields((prev) => new Set([...prev, name]))
      } else {
        setClientErrors((prev) => ({ ...prev, [name]: error }))
        setResolvedFields((prev) => { const next = new Set(prev); next.delete(name); return next })
      }
    }

    // When attacker changes and defender has the same-player error, clear it
    if (name === 'attacker_id' && clientErrors['defender_id'] === 'Attacker and defender cannot be the same player.') {
      if (value !== values.defender_id) {
        setClientErrors((prev) => { const next = { ...prev }; delete next['defender_id']; return next })
        setResolvedFields((prev) => new Set([...prev, 'defender_id']))
      }
    }
  }

  /**
   * Called when the edition changes. Clears mission/deployment/dispositions if
   * they don't belong to the newly selected edition, and surfaces an inline note.
   */
  function updateEdition(newEditionId: string) {
    const edId = Number(newEditionId)
    const editionMissions = edId ? (missionsByEdition[edId] ?? []) : []
    const editionDeployments = edId ? (deploymentsByEdition[edId] ?? []) : []
    const editionDispositions = edId ? (dispositionsByEdition[edId] ?? []) : []

    const cleared: string[] = []

    setValues((prev) => {
      const next = { ...prev, edition_id: newEditionId }

      if (prev.mission_id && !editionMissions.some((m) => String(m.id) === prev.mission_id)) {
        next.mission_id = ''
        cleared.push('mission')
      }
      if (prev.deployment_id && !editionDeployments.some((d) => String(d.id) === prev.deployment_id)) {
        next.deployment_id = ''
        cleared.push('deployment')
      }
      // Disposition ids are edition-scoped — they never carry over
      const attackerDispositionStale =
        prev.attacker_force_disposition_id &&
        !editionDispositions.some((fd) => String(fd.id) === prev.attacker_force_disposition_id)
      const defenderDispositionStale =
        prev.defender_force_disposition_id &&
        !editionDispositions.some((fd) => String(fd.id) === prev.defender_force_disposition_id)
      if (attackerDispositionStale || defenderDispositionStale) {
        next.attacker_force_disposition_id = ''
        next.defender_force_disposition_id = ''
        cleared.push('force dispositions')
      }

      return next
    })

    if (cleared.length > 0) {
      const plural = cleared.length > 1 || cleared.includes('force dispositions')
      setEditionClearedNote(`${cleared.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(' and ')} ${plural ? 'were' : 'was'} cleared because ${plural ? 'they belong' : 'it belongs'} to a different edition. Pick again.`)
    } else {
      setEditionClearedNote(null)
    }

    // Validate edition field
    const serverErrors = state?.errors as Record<string, string> | undefined
    const hasError = !!clientErrors['edition_id'] || !!serverErrors?.['edition_id']
    const wasResolved = resolvedFields.has('edition_id')
    if (hasError || wasResolved) {
      const error = validateEditionId(newEditionId)
      if (!error) {
        setClientErrors((prev) => { const next = { ...prev }; delete next['edition_id']; return next })
        setResolvedFields((prev) => new Set([...prev, 'edition_id']))
      } else {
        setClientErrors((prev) => ({ ...prev, ['edition_id']: error }))
        setResolvedFields((prev) => { const next = new Set(prev); next.delete('edition_id'); return next })
      }
    }
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

  // Edition-filtered missions and deployments
  const currentEditionId = Number(values.edition_id) || null
  const filteredMissions = useMemo(() => {
    if (!currentEditionId) return missions
    return missionsByEdition[currentEditionId] ?? []
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEditionId, missionsByEdition, missions])

  const filteredDeployments = useMemo(() => {
    if (!currentEditionId) return deployments
    return deploymentsByEdition[currentEditionId] ?? []
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEditionId, deploymentsByEdition, deployments])

  // Editions with force dispositions (11th) swap the Mission select for
  // per-player disposition selects; the primary missions are derived
  const editionDispositions = currentEditionId ? (dispositionsByEdition[currentEditionId] ?? []) : []
  const usesDispositions = editionDispositions.length > 0

  const attackerDispositionId = Number(values.attacker_force_disposition_id) || null
  const defenderDispositionId = Number(values.defender_force_disposition_id) || null
  const attackerPrimary =
    attackerDispositionId && defenderDispositionId
      ? filteredMissions.find(
          (m) =>
            m.force_disposition_id === attackerDispositionId &&
            m.opponent_force_disposition_id === defenderDispositionId,
        )
      : undefined
  const defenderPrimary =
    attackerDispositionId && defenderDispositionId
      ? filteredMissions.find(
          (m) =>
            m.force_disposition_id === defenderDispositionId &&
            m.opponent_force_disposition_id === attackerDispositionId,
        )
      : undefined

  function handleSubmit(formData: FormData) {
    formData.set('status', status)
    // Always include edition_id in formData
    if (values.edition_id) {
      formData.set('edition_id', values.edition_id)
    }

    // Always validate edition_id regardless of status
    const newErrors: Record<string, string> = {}
    const editionIdError = validateEditionId(values.edition_id)
    if (editionIdError) newErrors.edition_id = editionIdError

    if (status === 'published') {
      const eventDateError = validateEventDate(values.event_date)
      if (eventDateError) newErrors.event_date = eventDateError

      const attackerIdError = validatePlayerId(values.attacker_id)
      if (attackerIdError) newErrors.attacker_id = attackerIdError

      const attackerFactionIdError = validateFactionId(values.attacker_faction_id)
      if (attackerFactionIdError) newErrors.attacker_faction_id = attackerFactionIdError

      const attackerScoreError = validateScore(values.attacker_score)
      if (attackerScoreError) newErrors.attacker_score = attackerScoreError

      const attackerOutcomeError = validateOutcome(values.attacker_outcome)
      if (attackerOutcomeError) newErrors.attacker_outcome = attackerOutcomeError

      const defenderIdError = validatePlayerId(values.defender_id)
      if (defenderIdError) newErrors.defender_id = defenderIdError

      const defenderFactionIdError = validateFactionId(values.defender_faction_id)
      if (defenderFactionIdError) newErrors.defender_faction_id = defenderFactionIdError

      const defenderScoreError = validateScore(values.defender_score)
      if (defenderScoreError) newErrors.defender_score = defenderScoreError

      const defenderOutcomeError = validateOutcome(values.defender_outcome)
      if (defenderOutcomeError) newErrors.defender_outcome = defenderOutcomeError

      if (usesDispositions) {
        const attackerDispositionError = validateForceDisposition(values.attacker_force_disposition_id, { required: true })
        if (attackerDispositionError) newErrors.attacker_force_disposition_id = attackerDispositionError

        const defenderDispositionError = validateForceDisposition(values.defender_force_disposition_id, { required: true })
        if (defenderDispositionError) newErrors.defender_force_disposition_id = defenderDispositionError
      } else {
        const missionIdError = validateSelectId(values.mission_id)
        if (missionIdError) newErrors.mission_id = missionIdError
      }

      const attackerSecondaryModeError = validateSecondaryMode(values.attacker_secondary_mode)
      if (attackerSecondaryModeError) newErrors.attacker_secondary_mode = attackerSecondaryModeError

      const defenderSecondaryModeError = validateSecondaryMode(values.defender_secondary_mode)
      if (defenderSecondaryModeError) newErrors.defender_secondary_mode = defenderSecondaryModeError

      const deploymentIdError = validateSelectId(values.deployment_id)
      if (deploymentIdError) newErrors.deployment_id = deploymentIdError

      const battlePointsIdError = validateSelectId(values.battle_points_id)
      if (battlePointsIdError) newErrors.battle_points_id = battlePointsIdError

      const roundsError = validateRounds(values.rounds)
      if (roundsError) newErrors.rounds = roundsError

      const seasonIdError = validateSeasonId(values.season_id)
      if (seasonIdError) newErrors.season_id = seasonIdError

      if (!newErrors.defender_id && values.attacker_id && values.attacker_id === values.defender_id) {
        newErrors.defender_id = 'Attacker and defender cannot be the same player.'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setClientErrors(newErrors)
      setResolvedFields(new Set())
      return
    }

    setClientErrors({})
    setResolvedFields(new Set())

    if (roundStats.length > 0) {
      formData.set('round_stats_json', JSON.stringify(roundStats))
    }

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
                  className={`input input-lg input-bordered w-full ${fieldError('event_date') ? 'input-error' : fieldSuccess('event_date') ? 'input-success' : ''}`}
                  value={values.event_date}
                  onChange={(e) => updateField('event_date', e.target.value)}
                />
                {fieldError('event_date') && <p className="form-error">{fieldError('event_date')}</p>}
              </div>
              <div>
                <label className="label" htmlFor="season_id">
                  Season
                </label>
                <select
                  id="season_id"
                  name="season_id"
                  className={`select select-lg select-bordered w-full ${fieldError('season_id') ? 'select-error' : fieldSuccess('season_id') ? 'select-success' : ''}`}
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
                {fieldError('season_id') && <p className="form-error">{fieldError('season_id')}</p>}
              </div>
            </div>

            {/* Edition selector */}
            <div className="mt-1">
              <div>
                <label className="label" htmlFor="edition_id">
                  Edition
                </label>
                {/* Hidden input so edition_id is always submitted */}
                <input type="hidden" name="edition_id" value={values.edition_id} />
                <select
                  id="edition_id"
                  className={`select select-lg select-bordered w-full ${fieldError('edition_id') ? 'select-error' : fieldSuccess('edition_id') ? 'select-success' : ''}`}
                  value={values.edition_id}
                  onChange={(e) => updateEdition(e.target.value)}
                >
                  <option value="">Select edition</option>
                  {publishedEditions.map((edition) => (
                    <option key={edition.id} value={edition.id}>
                      {edition.name} ({edition.short_name})
                    </option>
                  ))}
                </select>
                {fieldError('edition_id') && <p className="form-error">{fieldError('edition_id')}</p>}
              </div>
            </div>

            {editionClearedNote && (
              <div role="alert" className="alert alert-info mt-2 text-sm">
                <span>{editionClearedNote}</span>
              </div>
            )}

            {usesDispositions && (
              <>
                <div className="form-grid mt-1">
                  <div>
                    <label className="label" htmlFor="attacker_force_disposition_id">
                      Attacker Force Disposition
                    </label>
                    <select
                      id="attacker_force_disposition_id"
                      name="attacker_force_disposition_id"
                      className={`select select-lg select-bordered w-full ${fieldError('attacker_force_disposition_id') ? 'select-error' : fieldSuccess('attacker_force_disposition_id') ? 'select-success' : ''}`}
                      value={values.attacker_force_disposition_id}
                      onChange={(e) => updateField('attacker_force_disposition_id', e.target.value)}
                    >
                      <option value="">Select force disposition</option>
                      {editionDispositions.map((fd) => (
                        <option key={fd.id} value={fd.id}>
                          {fd.name}
                        </option>
                      ))}
                    </select>
                    {fieldError('attacker_force_disposition_id') && (
                      <p className="form-error">{fieldError('attacker_force_disposition_id')}</p>
                    )}
                  </div>
                  <div>
                    <label className="label" htmlFor="defender_force_disposition_id">
                      Defender Force Disposition
                    </label>
                    <select
                      id="defender_force_disposition_id"
                      name="defender_force_disposition_id"
                      className={`select select-lg select-bordered w-full ${fieldError('defender_force_disposition_id') ? 'select-error' : fieldSuccess('defender_force_disposition_id') ? 'select-success' : ''}`}
                      value={values.defender_force_disposition_id}
                      onChange={(e) => updateField('defender_force_disposition_id', e.target.value)}
                    >
                      <option value="">Select force disposition</option>
                      {editionDispositions.map((fd) => (
                        <option key={fd.id} value={fd.id}>
                          {fd.name}
                        </option>
                      ))}
                    </select>
                    {fieldError('defender_force_disposition_id') && (
                      <p className="form-error">{fieldError('defender_force_disposition_id')}</p>
                    )}
                  </div>
                </div>

                {attackerDispositionId != null && defenderDispositionId != null && (
                  <div className="mt-2 rounded-lg bg-base-200 p-4 text-sm">
                    <span className="label-meta">Primary Missions</span>
                    {attackerPrimary || defenderPrimary ? (
                      <p className="mt-1">
                        Attacker plays <span className="font-semibold">{attackerPrimary?.name ?? '—'}</span> —
                        Defender plays <span className="font-semibold">{defenderPrimary?.name ?? '—'}</span>
                      </p>
                    ) : (
                      <p className="mt-1">No mission mapped for this matchup.</p>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="form-grid mt-1">
              {!usesDispositions && (
                <div>
                  <label className="label" htmlFor="mission_id">
                    Mission
                  </label>
                  <select
                    id="mission_id"
                    name="mission_id"
                    className={`select select-lg select-bordered w-full ${fieldError('mission_id') ? 'select-error' : fieldSuccess('mission_id') ? 'select-success' : ''}`}
                    value={values.mission_id}
                    onChange={(e) => updateField('mission_id', e.target.value)}
                    disabled={!currentEditionId}
                  >
                    <option value="">{!currentEditionId ? 'Select an edition first' : 'Select mission'}</option>
                    {filteredMissions.map((mission) => (
                      <option key={mission.id} value={mission.id}>
                        {mission.name}
                      </option>
                    ))}
                  </select>
                  {fieldError('mission_id') && <p className="form-error">{fieldError('mission_id')}</p>}
                </div>
              )}
              <div>
                <label className="label" htmlFor="deployment_id">
                  Deployment
                </label>
                <select
                  id="deployment_id"
                  name="deployment_id"
                  className={`select select-lg select-bordered w-full ${fieldError('deployment_id') ? 'select-error' : fieldSuccess('deployment_id') ? 'select-success' : ''}`}
                  value={values.deployment_id}
                  onChange={(e) => updateField('deployment_id', e.target.value)}
                  disabled={!currentEditionId}
                >
                  <option value="">{!currentEditionId ? 'Select an edition first' : 'Select deployment'}</option>
                  {filteredDeployments.map((deployment) => (
                    <option key={deployment.id} value={deployment.id}>
                      {deployment.name}
                    </option>
                  ))}
                </select>
                {fieldError('deployment_id') && (
                  <p className="form-error">{fieldError('deployment_id')}</p>
                )}
              </div>
            </div>

            {usesDispositions && (
              <div className="form-grid mt-1">
                <div>
                  <label className="label" htmlFor="attacker_secondary_mode">
                    Attacker Secondary Missions <span className="text-sm text-base-content/50">(optional)</span>
                  </label>
                  <select
                    id="attacker_secondary_mode"
                    name="attacker_secondary_mode"
                    className={`select select-lg select-bordered w-full ${fieldError('attacker_secondary_mode') ? 'select-error' : fieldSuccess('attacker_secondary_mode') ? 'select-success' : ''}`}
                    value={values.attacker_secondary_mode}
                    onChange={(e) => updateField('attacker_secondary_mode', e.target.value)}
                  >
                    <option value="">Not recorded</option>
                    <option value="tactical">Tactical</option>
                    <option value="fixed">Fixed</option>
                  </select>
                  {fieldError('attacker_secondary_mode') && (
                    <p className="form-error">{fieldError('attacker_secondary_mode')}</p>
                  )}
                </div>
                <div>
                  <label className="label" htmlFor="defender_secondary_mode">
                    Defender Secondary Missions <span className="text-sm text-base-content/50">(optional)</span>
                  </label>
                  <select
                    id="defender_secondary_mode"
                    name="defender_secondary_mode"
                    className={`select select-lg select-bordered w-full ${fieldError('defender_secondary_mode') ? 'select-error' : fieldSuccess('defender_secondary_mode') ? 'select-success' : ''}`}
                    value={values.defender_secondary_mode}
                    onChange={(e) => updateField('defender_secondary_mode', e.target.value)}
                  >
                    <option value="">Not recorded</option>
                    <option value="tactical">Tactical</option>
                    <option value="fixed">Fixed</option>
                  </select>
                  {fieldError('defender_secondary_mode') && (
                    <p className="form-error">{fieldError('defender_secondary_mode')}</p>
                  )}
                </div>
              </div>
            )}

            <div className="form-grid mt-1">
              <div>
                <label className="label" htmlFor="battle_points_id">
                  Battle Size
                </label>
                <select
                  id="battle_points_id"
                  name="battle_points_id"
                  className={`select select-lg select-bordered w-full ${fieldError('battle_points_id') ? 'select-error' : fieldSuccess('battle_points_id') ? 'select-success' : ''}`}
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
                {fieldError('battle_points_id') && (
                  <p className="form-error">{fieldError('battle_points_id')}</p>
                )}
              </div>
              <div>
                <label className="label" htmlFor="rounds">
                  Rounds Played
                </label>
                <select
                  id="rounds"
                  name="rounds"
                  className={`select select-lg select-bordered w-full ${fieldError('rounds') ? 'select-error' : fieldSuccess('rounds') ? 'select-success' : ''}`}
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
                {fieldError('rounds') && <p className="form-error">{fieldError('rounds')}</p>}
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
                  className={`select select-lg select-bordered w-full ${fieldError('attacker_id') ? 'select-error' : fieldSuccess('attacker_id') ? 'select-success' : ''}`}
                  value={values.attacker_id}
                  onChange={(e) => {
                    updateField('attacker_id', e.target.value)
                    updateField('attacker_faction_id', '')
                  }}
                >
                  <option value="">Select player</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.display_name}
                    </option>
                  ))}
                </select>
                {fieldError('attacker_id') && <p className="form-error">{fieldError('attacker_id')}</p>}
              </div>
              <div>
                <label className="label" htmlFor="attacker_faction_id">
                  Faction
                </label>
                <select
                  id="attacker_faction_id"
                  name="attacker_faction_id"
                  className={`select select-lg select-bordered w-full ${fieldError('attacker_faction_id') ? 'select-error' : fieldSuccess('attacker_faction_id') ? 'select-success' : ''}`}
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
                {fieldError('attacker_faction_id') && (
                  <p className="form-error">{fieldError('attacker_faction_id')}</p>
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
                  className={`input input-lg input-bordered w-full ${fieldError('attacker_score') ? 'input-error' : fieldSuccess('attacker_score') ? 'input-success' : ''}`}
                  value={values.attacker_score}
                  onChange={(e) => updateField('attacker_score', e.target.value)}
                />
                {fieldError('attacker_score') && (
                  <p className="form-error">{fieldError('attacker_score')}</p>
                )}
              </div>
              <div>
                <label className="label" htmlFor="attacker_outcome">
                  Outcome
                </label>
                <select
                  id="attacker_outcome"
                  name="attacker_outcome"
                  className={`select select-lg select-bordered w-full ${fieldError('attacker_outcome') ? 'select-error' : fieldSuccess('attacker_outcome') ? 'select-success' : ''}`}
                  value={values.attacker_outcome}
                  onChange={(e) => updateField('attacker_outcome', e.target.value)}
                >
                  <option value="">Select outcome</option>
                  <option value="win">Win</option>
                  <option value="loss">Loss</option>
                  <option value="draw">Draw</option>
                </select>
                {fieldError('attacker_outcome') && (
                  <p className="form-error">{fieldError('attacker_outcome')}</p>
                )}
              </div>
            </div>

            <div className="form-grid mt-1">
              <div>
                <label className="label" htmlFor="attacker_units_lost">
                  Units Lost
                </label>
                <input
                  id="attacker_units_lost"
                  name="attacker_units_lost"
                  type="number"
                  min={0}
                  className="input input-lg input-bordered w-full"
                  value={values.attacker_units_lost}
                  onChange={(e) => updateField('attacker_units_lost', e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="attacker_models_lost">
                  Models Lost
                </label>
                <input
                  id="attacker_models_lost"
                  name="attacker_models_lost"
                  type="number"
                  min={0}
                  className="input input-lg input-bordered w-full"
                  value={values.attacker_models_lost}
                  onChange={(e) => updateField('attacker_models_lost', e.target.value)}
                />
              </div>
            </div>

            <div className="mt-1">
              <label className="label cursor-pointer justify-start gap-4">
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
                  className={`select select-lg select-bordered w-full ${fieldError('defender_id') ? 'select-error' : fieldSuccess('defender_id') ? 'select-success' : ''}`}
                  value={values.defender_id}
                  onChange={(e) => {
                    updateField('defender_id', e.target.value)
                    updateField('defender_faction_id', '')
                  }}
                >
                  <option value="">Select player</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.display_name}
                    </option>
                  ))}
                </select>
                {fieldError('defender_id') && (
                  <p className="form-error">{fieldError('defender_id')}</p>
                )}
              </div>
              <div>
                <label className="label" htmlFor="defender_faction_id">
                  Faction
                </label>
                <select
                  id="defender_faction_id"
                  name="defender_faction_id"
                  className={`select select-lg select-bordered w-full ${fieldError('defender_faction_id') ? 'select-error' : fieldSuccess('defender_faction_id') ? 'select-success' : ''}`}
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
                {fieldError('defender_faction_id') && (
                  <p className="form-error">{fieldError('defender_faction_id')}</p>
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
                  className={`input input-lg input-bordered w-full ${fieldError('defender_score') ? 'input-error' : fieldSuccess('defender_score') ? 'input-success' : ''}`}
                  value={values.defender_score}
                  onChange={(e) => updateField('defender_score', e.target.value)}
                />
                {fieldError('defender_score') && (
                  <p className="form-error">{fieldError('defender_score')}</p>
                )}
              </div>
              <div>
                <label className="label" htmlFor="defender_outcome">
                  Outcome
                </label>
                <select
                  id="defender_outcome"
                  name="defender_outcome"
                  className={`select select-lg select-bordered w-full ${fieldError('defender_outcome') ? 'select-error' : fieldSuccess('defender_outcome') ? 'select-success' : ''}`}
                  value={values.defender_outcome}
                  onChange={(e) => updateField('defender_outcome', e.target.value)}
                >
                  <option value="">Select outcome</option>
                  <option value="win">Win</option>
                  <option value="loss">Loss</option>
                  <option value="draw">Draw</option>
                </select>
                {fieldError('defender_outcome') && (
                  <p className="form-error">{fieldError('defender_outcome')}</p>
                )}
              </div>
            </div>

            <div className="form-grid mt-1">
              <div>
                <label className="label" htmlFor="defender_units_lost">
                  Units Lost
                </label>
                <input
                  id="defender_units_lost"
                  name="defender_units_lost"
                  type="number"
                  min={0}
                  className="input input-lg input-bordered w-full"
                  value={values.defender_units_lost}
                  onChange={(e) => updateField('defender_units_lost', e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="defender_models_lost">
                  Models Lost
                </label>
                <input
                  id="defender_models_lost"
                  name="defender_models_lost"
                  type="number"
                  min={0}
                  className="input input-lg input-bordered w-full"
                  value={values.defender_models_lost}
                  onChange={(e) => updateField('defender_models_lost', e.target.value)}
                />
              </div>
            </div>

            <div className="mt-1">
              <label className="label cursor-pointer justify-start gap-4">
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

        {/* Round Stats Section */}
        <div>
          <h2 className="ornament section-header">Round Stats</h2>
          <fieldset className="form-section">
            <p className="mb-4 text-sm text-base-content/50">
              Optionally track stats for each round played. All fields default to 0.
            </p>

            {roundStats.map((round, index) => (
              <div key={index} className="card card-bordered mb-4 bg-base-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">Round {round.round_number}</h3>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm text-error"
                    onClick={() => removeRound(index)}
                  >
                    Remove
                  </button>
                </div>

                <div className="mb-2">
                  <span className="label-meta">Attacker</span>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="label text-xs" htmlFor={`round_${index}_attacker_points`}>
                        Points Earned
                      </label>
                      <input
                        id={`round_${index}_attacker_points`}
                        type="number"
                        min={0}
                        className="input input-bordered w-full"
                        value={round.attacker_points_earned}
                        onChange={(e) => updateRoundStat(index, 'attacker_points_earned', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label text-xs" htmlFor={`round_${index}_attacker_units`}>
                        Units Lost
                      </label>
                      <input
                        id={`round_${index}_attacker_units`}
                        type="number"
                        min={0}
                        className="input input-bordered w-full"
                        value={round.attacker_units_lost}
                        onChange={(e) => updateRoundStat(index, 'attacker_units_lost', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label text-xs" htmlFor={`round_${index}_attacker_models`}>
                        Models Lost
                      </label>
                      <input
                        id={`round_${index}_attacker_models`}
                        type="number"
                        min={0}
                        className="input input-bordered w-full"
                        value={round.attacker_models_lost}
                        onChange={(e) => updateRoundStat(index, 'attacker_models_lost', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <span className="label-meta">Defender</span>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="label text-xs" htmlFor={`round_${index}_defender_points`}>
                        Points Earned
                      </label>
                      <input
                        id={`round_${index}_defender_points`}
                        type="number"
                        min={0}
                        className="input input-bordered w-full"
                        value={round.defender_points_earned}
                        onChange={(e) => updateRoundStat(index, 'defender_points_earned', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label text-xs" htmlFor={`round_${index}_defender_units`}>
                        Units Lost
                      </label>
                      <input
                        id={`round_${index}_defender_units`}
                        type="number"
                        min={0}
                        className="input input-bordered w-full"
                        value={round.defender_units_lost}
                        onChange={(e) => updateRoundStat(index, 'defender_units_lost', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label text-xs" htmlFor={`round_${index}_defender_models`}>
                        Models Lost
                      </label>
                      <input
                        id={`round_${index}_defender_models`}
                        type="number"
                        min={0}
                        className="input input-bordered w-full"
                        value={round.defender_models_lost}
                        onChange={(e) => updateRoundStat(index, 'defender_models_lost', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={addRound}
              disabled={roundStats.length >= 5}
            >
              + Add Round {roundStats.length > 0 && `(${roundStats.length}/5)`}
            </button>
            {fieldError('round_stats') && <p className="form-error mt-2">{fieldError('round_stats')}</p>}
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
              className={`select select-lg select-bordered w-full ${fieldError('status') ? 'select-error' : fieldSuccess('status') ? 'select-success' : ''}`}
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              disabled={statusLocked}
            >
              <option value="draft">Draft</option>
              <option value="published">Publish</option>
            </select>
            {fieldError('status') && <p className="form-error">{fieldError('status')}</p>}
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
