'use client'

import ActionsMenu from '@/components/actions-menu'
import { useActionState, useEffect, useState } from 'react'
import { toggleRole, type ToggleRoleState } from './actions'

type UserWithRoles = {
  id: string
  profile_id: number
  display_name: string
  avatar_url: string | null
  roles: string[]
}

type UserManagementTableProps = {
  users: UserWithRoles[]
  currentUserId: string
  assignableRoles: string[]
}

function RemoveRoleButton({
  userId,
  role,
  onResult,
}: {
  userId: string
  role: string
  onResult: (state: ToggleRoleState) => void
}) {
  const [state, formAction, isPending] = useActionState(toggleRole, null)

  useEffect(() => {
    if (state) onResult(state)
  }, [state, onResult])

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="role" value={role} />
      <button
        type="submit"
        disabled={isPending}
        className="badge badge-sm gap-1 cursor-pointer hover:badge-error"
        aria-label={`Remove ${role} role`}
      >
        {role}
        {isPending ? (
          <span className="loading loading-spinner w-3 h-3" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        )}
      </button>
    </form>
  )
}

function AddRoleButton({
  userId,
  role,
  onResult,
}: {
  userId: string
  role: string
  onResult: (state: ToggleRoleState) => void
}) {
  const [state, formAction, isPending] = useActionState(toggleRole, null)

  useEffect(() => {
    if (state) onResult(state)
  }, [state, onResult])

  return (
    <li>
      <form action={formAction}>
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="role" value={role} />
        <button type="submit" disabled={isPending} className="w-full text-left">
          {isPending ? <span className="loading loading-spinner loading-xs" /> : role}
        </button>
      </form>
    </li>
  )
}

export default function UserManagementTable({ users, currentUserId, assignableRoles }: UserManagementTableProps) {
  const [alert, setAlert] = useState<ToggleRoleState>(null)

  function handleResult(state: ToggleRoleState) {
    setAlert(state)
  }

  return (
    <div>
      {alert?.success && (
        <div className="alert alert-success mb-4">
          <span>{alert.success}</span>
        </div>
      )}
      {alert?.error && (
        <div className="alert alert-error mb-4">
          <span>{alert.error}</span>
        </div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u.id === currentUserId
            const removableRoles = u.roles.filter((r) => assignableRoles.includes(r))
            const protectedRoles = u.roles.filter((r) => !assignableRoles.includes(r))
            const availableRoles = assignableRoles.filter((r) => !u.roles.includes(r))

            return (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-10 rounded-full">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.display_name} />
                        ) : (
                          <div className="bg-neutral text-neutral-content flex items-center justify-center w-full h-full text-sm font-bold">
                            {u.display_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="font-medium">{u.display_name}</span>
                  </div>
                </td>
                <td>
                  <div className="flex flex-wrap items-center gap-1">
                    {protectedRoles.map((role) => (
                      <span key={role} className="badge badge-sm badge-ghost">
                        {role}
                      </span>
                    ))}

                    {isSelf
                      ? removableRoles.map((role) => (
                          <span key={role} className="badge badge-sm badge-outline">
                            {role}
                          </span>
                        ))
                      : removableRoles.map((role) => (
                          <RemoveRoleButton key={role} userId={u.id} role={role} onResult={handleResult} />
                        ))}

                    {!isSelf && availableRoles.length > 0 && (
                      <div className="dropdown dropdown-end">
                        <div
                          tabIndex={0}
                          role="button"
                          className="badge badge-sm badge-dash cursor-pointer hover:badge-success"
                          aria-label="Add role"
                        >
                          +
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu bg-base-200 rounded-box z-10 w-40 p-2 shadow-sm"
                        >
                          {availableRoles.map((role) => (
                            <AddRoleButton key={role} userId={u.id} role={role} onResult={handleResult} />
                          ))}
                        </ul>
                      </div>
                    )}

                    {isSelf && <span className="text-xs italic text-base-content/50 ml-1">(you)</span>}
                  </div>
                </td>
                <td>
                  <ActionsMenu
                    items={[
                      { label: 'View Profile', href: `/profile/${u.profile_id}` },
                      { label: 'Edit User', href: `/admin/user-management/${u.profile_id}/edit` },
                    ]}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
