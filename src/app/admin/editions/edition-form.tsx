'use client'

import type { Edition, EditionStatus } from '@/types/edition'
import { startTransition, useActionState, useState } from 'react'
import { createEdition, updateEdition, type EditionFormState } from './actions'

type EditionFormProps = {
  edition?: Edition
}

export default function EditionForm({ edition }: EditionFormProps) {
  const [status, setStatus] = useState<EditionStatus>(edition?.status ?? 'draft')
  const action = edition ? updateEdition : createEdition
  const [state, formAction, pending] = useActionState<EditionFormState, FormData>(action, null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(() => {
      formAction(new FormData(e.currentTarget))
    })
  }

  function handleShortNameBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.target.value = e.target.value.trim().toLowerCase()
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
        {edition && <input type="hidden" name="edition_id" value={edition.id} />}

        {/* Identity */}
        <div>
          <h2 className="ornament section-header">Identity</h2>
          <fieldset className="form-section">
            <label className="label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`input input-bordered w-full ${state?.errors?.name ? 'input-error' : ''}`}
              defaultValue={edition?.name ?? ''}
              placeholder="e.g. 11th Edition"
              required
            />
            {state?.errors?.name && <p className="form-error">{state.errors.name}</p>}

            <label className="label mt-4" htmlFor="short_name">
              Short Name
            </label>
            <input
              id="short_name"
              name="short_name"
              type="text"
              className={`input input-bordered w-full ${state?.errors?.short_name ? 'input-error' : ''}`}
              defaultValue={edition?.short_name ?? ''}
              placeholder="e.g. 11th"
              onBlur={handleShortNameBlur}
              required
            />
            {state?.errors?.short_name && <p className="form-error">{state.errors.short_name}</p>}
            <p className="mt-1 text-sm text-base-content/50">
              Lowercase letters, numbers, and hyphens only. Used as the compact edition label throughout the app.
            </p>
          </fieldset>
        </div>

        {/* Content */}
        <div>
          <h2 className="ornament section-header">Content</h2>
          <fieldset className="form-section">
            <label className="label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="textarea w-full"
              rows={6}
              defaultValue={edition?.description ?? ''}
              placeholder="Optional edition description"
            />
          </fieldset>
        </div>

        {/* Settings */}
        <div>
          <h2 className="ornament section-header">Settings</h2>
          <fieldset className="form-section">
            <label className="label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              className={`select select-bordered w-full ${state?.errors?.status ? 'select-error' : ''}`}
              value={status}
              onChange={(e) => setStatus(e.target.value as EditionStatus)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            {state?.errors?.status && <p className="form-error">{state.errors.status}</p>}
            <p className="mt-2 text-sm text-base-content/50">
              {status === 'draft'
                ? 'Draft editions are only visible to admins.'
                : 'Published editions are selectable by members when submitting battle reports.'}
            </p>

            {edition ? (
              <>
                <label className="label mt-4 cursor-not-allowed justify-start gap-3">
                  <input type="checkbox" className="checkbox" checked={edition.is_default} disabled />
                  <span>Default edition</span>
                </label>
                <p className="text-sm text-base-content/50">
                  Use the &ldquo;Set as Default&rdquo; action on the editions list to change which edition is the
                  default.
                </p>
              </>
            ) : (
              <>
                <label className="label mt-4 cursor-pointer justify-start gap-3">
                  <input type="checkbox" name="is_default" className="checkbox checkbox-primary" />
                  <span>Set as default edition</span>
                </label>
                <p className="text-sm text-base-content/50">
                  The default edition is preselected when submitting battle reports. Setting this unsets the current
                  default.
                </p>
              </>
            )}
          </fieldset>
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={pending}>
          {pending ? (
            <span className="loading loading-spinner loading-sm" />
          ) : edition ? (
            'Update Edition'
          ) : (
            'Create Edition'
          )}
        </button>
      </form>
    </>
  )
}
