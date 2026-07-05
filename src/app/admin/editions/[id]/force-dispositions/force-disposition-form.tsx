'use client'

import type { ForceDisposition } from '@/types/force-disposition'
import { startTransition, useActionState, useEffect, useRef } from 'react'
import { createForceDisposition, updateForceDisposition, type ForceDispositionFormState } from './actions'

type ForceDispositionFormProps = {
  editionId: number
  forceDisposition?: ForceDisposition
}

export default function ForceDispositionForm({ editionId, forceDisposition }: ForceDispositionFormProps) {
  const action = forceDisposition ? updateForceDisposition : createForceDisposition
  const [state, formAction, pending] = useActionState<ForceDispositionFormState, FormData>(action, null)
  const formRef = useRef<HTMLFormElement>(null)
  const isEdit = !!forceDisposition

  useEffect(() => {
    if (!isEdit && state?.success) {
      formRef.current?.reset()
    }
  }, [state, isEdit])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(() => {
      formAction(new FormData(e.currentTarget))
    })
  }

  return (
    <>
      {state?.success && (
        <div role="alert" className="alert alert-success mb-4">
          <span>{state.success}</span>
        </div>
      )}

      {state?.error && (
        <div role="alert" className="alert alert-error mb-4">
          <span>{state.error}</span>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
        {forceDisposition ? (
          <input type="hidden" name="force_disposition_id" value={forceDisposition.id} />
        ) : (
          <input type="hidden" name="edition_id" value={editionId} />
        )}

        <div>
          <label className="label" htmlFor="name">
            Force Disposition Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={forceDisposition?.name ?? ''}
            placeholder="e.g. Death Trap"
            className={`input input-bordered w-full ${state?.errors?.name ? 'input-error' : ''}`}
          />
          {state?.errors?.name && <p className="mt-1 text-sm text-error">{state.errors.name}</p>}
        </div>

        <div>
          <label className="label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={forceDisposition?.description ?? ''}
            placeholder="Optional description of this disposition's playstyle"
            className={`textarea textarea-bordered w-full ${state?.errors?.description ? 'textarea-error' : ''}`}
          />
          {state?.errors?.description && <p className="mt-1 text-sm text-error">{state.errors.description}</p>}
        </div>

        <button type="submit" disabled={pending} className="btn btn-primary w-fit">
          {pending ? 'Saving…' : isEdit ? 'Save' : 'Add Force Disposition'}
        </button>
      </form>
    </>
  )
}
