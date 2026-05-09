'use client'

import type { Mission } from '@/types/battle-report'
import { startTransition, useActionState, useEffect, useRef } from 'react'
import { createMission, updateMission, type MissionFormState } from './actions'

type MissionFormProps = {
  editionId: number
  mission?: Mission
}

export default function MissionForm({ editionId, mission }: MissionFormProps) {
  const action = mission ? updateMission : createMission
  const [state, formAction, pending] = useActionState<MissionFormState, FormData>(action, null)
  const formRef = useRef<HTMLFormElement>(null)
  const isEdit = !!mission

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
        {mission ? (
          <input type="hidden" name="mission_id" value={mission.id} />
        ) : (
          <input type="hidden" name="edition_id" value={editionId} />
        )}

        <div>
          <label className="label" htmlFor="name">
            Mission Name
          </label>
          <div className="flex gap-2">
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={mission?.name ?? ''}
              placeholder="e.g. Take and Hold"
              className={`input input-bordered flex-1 ${state?.errors?.name ? 'input-error' : ''}`}
            />
            <button type="submit" disabled={pending} className="btn btn-primary">
              {pending ? 'Saving…' : isEdit ? 'Save' : 'Add Mission'}
            </button>
          </div>
          {state?.errors?.name && <p className="mt-1 text-sm text-error">{state.errors.name}</p>}
        </div>
      </form>
    </>
  )
}
