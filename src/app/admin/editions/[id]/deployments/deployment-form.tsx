'use client'

import type { Deployment } from '@/types/battle-report'
import { startTransition, useActionState, useEffect, useRef } from 'react'
import { createDeployment, updateDeployment, type DeploymentFormState } from './actions'

type DeploymentFormProps = {
  editionId: number
  deployment?: Deployment
}

export default function DeploymentForm({ editionId, deployment }: DeploymentFormProps) {
  const action = deployment ? updateDeployment : createDeployment
  const [state, formAction, pending] = useActionState<DeploymentFormState, FormData>(action, null)
  const formRef = useRef<HTMLFormElement>(null)
  const isEdit = !!deployment

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
        {deployment ? (
          <input type="hidden" name="deployment_id" value={deployment.id} />
        ) : (
          <input type="hidden" name="edition_id" value={editionId} />
        )}

        <div>
          <label className="label" htmlFor="name">
            Deployment Name
          </label>
          <div className="flex gap-2">
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={deployment?.name ?? ''}
              placeholder="e.g. Search and Destroy"
              className={`input input-bordered flex-1 ${state?.errors?.name ? 'input-error' : ''}`}
            />
            <button type="submit" disabled={pending} className="btn btn-primary">
              {pending ? 'Saving…' : isEdit ? 'Save' : 'Add Deployment'}
            </button>
          </div>
          {state?.errors?.name && <p className="mt-1 text-sm text-error">{state.errors.name}</p>}
        </div>
      </form>
    </>
  )
}
