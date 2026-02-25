'use client'

import MarkdownEditor from '@/modules/markdown/components/markdown-editor'
import type { BattlePoints } from '@/types/battle-report'
import type { Season, SeasonStatus } from '@/types/season'
import { startTransition, useActionState, useState } from 'react'
import { createSeason, updateSeason, type SeasonFormState } from './actions'

type SeasonFormProps = {
  battlePoints: BattlePoints[]
  season?: Season
  nextNumber?: number
}

export default function SeasonForm({ battlePoints, season, nextNumber }: SeasonFormProps) {
  const seasonNumber = season?.number ?? nextNumber
  const [status, setStatus] = useState<SeasonStatus>(season?.status ?? 'draft')
  const action = season ? updateSeason : createSeason
  const [state, formAction, pending] = useActionState<SeasonFormState, FormData>(action, null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(() => {
      formAction(new FormData(e.currentTarget))
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {season && <input type="hidden" name="season_id" value={season.id} />}

        {/* Identity */}
        <div>
          <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">Identity</h2>
          <fieldset className="fieldset bg-base-300 rounded-box p-5">
            {seasonNumber && (
              <p className="mb-3 text-lg font-bold">Season {seasonNumber}</p>
            )}
            <label className="label" htmlFor="name">
              Season Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`input input-bordered w-full ${state?.errors?.name ? 'input-error' : ''}`}
              defaultValue={season?.name ?? ''}
              placeholder="e.g. The Crusade Begins (optional)"
            />
            {state?.errors?.name && <p className="mt-1 text-sm text-error">{state.errors.name}</p>}
            <p className="mt-1 text-sm text-base-content/50">
              Displayed as &ldquo;Season {seasonNumber}{' '}
              {season?.name ? `- ${season.name}` : '- Name'}&rdquo;. Leave blank for just &ldquo;Season{' '}
              {seasonNumber}&rdquo;.
            </p>
          </fieldset>
        </div>

        {/* Schedule */}
        <div>
          <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">Schedule</h2>
          <fieldset className="fieldset bg-base-300 rounded-box p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              <div>
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
              </div>
              <div>
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
              </div>
            </div>
          </fieldset>
        </div>

        {/* Format */}
        <div>
          <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">Format</h2>
          <fieldset className="fieldset bg-base-300 rounded-box p-5">
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
          </fieldset>
        </div>

        {/* Content */}
        <div>
          <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">Content</h2>
          <fieldset className="fieldset bg-base-300 rounded-box p-5">
            <label className="label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className='textarea w-full'
              rows={8}
              defaultValue={season?.description ?? ''}
              placeholder="Optional season description"
            />
          </fieldset>
        </div>
        <div>
          <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">Rules &amp; Regulations</h2>
          <fieldset className="fieldset bg-base-300 rounded-box p-5">
            <label className="label mt-3" htmlFor="rules">
              Rules
            </label>
            <MarkdownEditor
              id="rules"
              name="rules"
              rows={16}
              defaultValue={season?.rules ?? ''}
              placeholder="Optional season rules"
            />
          </fieldset>
        </div>

        {/* Settings */}
        <div>
          <h2 className="ornament mb-4 text-sm font-semibold uppercase tracking-widest">Settings</h2>
          <fieldset className="fieldset bg-base-300 rounded-box p-5">
            <label className="label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              className={`select select-bordered w-full ${state?.errors?.status ? 'select-error' : ''}`}
              value={status}
              onChange={(e) => setStatus(e.target.value as SeasonStatus)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            {state?.errors?.status && <p className="mt-1 text-sm text-error">{state.errors.status}</p>}
            <p className="mt-2 text-sm text-base-content/50">
              {status === 'draft'
                ? 'Draft seasons are only visible to admins.'
                : 'Published seasons are visible to all users. A season is automatically current when today falls within its date range.'}
            </p>

            {!season && (
              <>
                <label className="label cursor-pointer justify-start gap-3 mt-4">
                  <input type="checkbox" name="backfill" className="checkbox checkbox-primary" />
                  <span>Backfill existing battle reports</span>
                </label>
                <p className="text-sm text-base-content/50">
                  Assign unassigned battle reports within this date range to this season.
                </p>
              </>
            )}
          </fieldset>
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={pending}>
          {pending ? (
            <span className="loading loading-spinner loading-sm" />
          ) : season ? (
            'Update Season'
          ) : (
            'Create Season'
          )}
        </button>
      </form>
    </>
  )
}
