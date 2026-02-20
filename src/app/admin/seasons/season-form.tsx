'use client'

import type { BattlePoints } from '@/types/battle-report'
import type { Season } from '@/types/season'
import { startTransition, useActionState } from 'react'
import { createSeason, updateSeason, type SeasonFormState } from './actions'

type SeasonFormProps = {
  battlePoints: BattlePoints[]
  season?: Season
}

export default function SeasonForm({ battlePoints, season }: SeasonFormProps) {
  const action = season ? updateSeason : createSeason
  const [state, formAction, pending] = useActionState<SeasonFormState, FormData>(action, null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(() => {
      formAction(new FormData(e.currentTarget))
    })
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body gap-4">
        <h2 className="card-title text-2xl">{season ? 'Edit Season' : 'Create Season'}</h2>

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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {season && <input type="hidden" name="season_id" value={season.id} />}

          <fieldset className="fieldset">
            <label className="label" htmlFor="name">
              Season Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`input input-bordered w-full ${state?.errors?.name ? 'input-error' : ''}`}
              required
              defaultValue={season?.name ?? ''}
              placeholder="e.g. Season 1 - The Crusade Begins"
            />
            {state?.errors?.name && <p className="mt-1 text-sm text-error">{state.errors.name}</p>}

            <label className="label" htmlFor="start_date">
              Start Date
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              className={`input input-bordered w-full ${state?.errors?.start_date ? 'input-error' : ''}`}
              required
              defaultValue={season?.start_date ?? ''}
            />
            {state?.errors?.start_date && <p className="mt-1 text-sm text-error">{state.errors.start_date}</p>}

            <label className="label" htmlFor="end_date">
              End Date
            </label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              className={`input input-bordered w-full ${state?.errors?.end_date ? 'input-error' : ''}`}
              required
              defaultValue={season?.end_date ?? ''}
            />
            {state?.errors?.end_date && <p className="mt-1 text-sm text-error">{state.errors.end_date}</p>}

            <label className="label" htmlFor="battle_points_id">
              Battle Size
            </label>
            <select
              id="battle_points_id"
              name="battle_points_id"
              className={`select select-bordered w-full ${state?.errors?.battle_points_id ? 'select-error' : ''}`}
              required
              defaultValue={season?.battle_points_id ?? ''}
            >
              <option value="">Select battle size</option>
              {battlePoints.map((bp) => (
                <option key={bp.id} value={bp.id}>
                  {bp.name} ({bp.size} pts)
                </option>
              ))}
            </select>
            {state?.errors?.battle_points_id && (
              <p className="mt-1 text-sm text-error">{state.errors.battle_points_id}</p>
            )}

            <label className="label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="textarea textarea-bordered w-full"
              rows={3}
              defaultValue={season?.description ?? ''}
              placeholder="Optional season description or rules"
            />

            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                name="is_active"
                className="checkbox checkbox-primary"
                defaultChecked={season?.is_active ?? false}
              />
              <span>Active season</span>
            </label>
            <p className="text-sm text-base-content/50">
              Only one season can be active at a time. Activating this season will deactivate the current one.
            </p>

            {!season && (
              <>
                <label className="label cursor-pointer justify-start gap-3 mt-2">
                  <input type="checkbox" name="backfill" className="checkbox checkbox-primary" />
                  <span>Backfill existing battle reports</span>
                </label>
                <p className="text-sm text-base-content/50">
                  Assign unassigned battle reports within this date range to this season.
                </p>
              </>
            )}
          </fieldset>

          <button type="submit" className="btn btn-primary w-full" disabled={pending}>
            {pending ? <span className="loading loading-spinner loading-sm" /> : season ? 'Update Season' : 'Create Season'}
          </button>
        </form>
      </div>
    </div>
  )
}
