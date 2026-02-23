'use client'

import ActionsMenu from '@/components/actions-menu'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { useActionState, useEffect, useState } from 'react'
import { toggleRole, type ToggleRoleState } from './actions'

type UserWithRoles = {
  id: string
  user_id: string | null
  profile_id: number
  display_name: string
  avatar_url: string | null
  role: 'member' | 'organizer'
  authRoles: string[]
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
    <MenuItem>
      <form action={formAction}>
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="role" value={role} />
        <button
          type="submit"
          disabled={isPending}
          className="btn btn-ghost block w-full rounded-btn px-3 py-2 text-left text-sm data-[focus]:bg-base-300"
        >
          {isPending ? <span className="loading loading-spinner loading-xs" /> : role}
        </button>
      </form>
    </MenuItem>
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
            <th>League Role</th>
            <th>Auth Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u.user_id === currentUserId
            const isLinked = !!u.user_id
            const removableRoles = u.authRoles.filter((r) => assignableRoles.includes(r))
            const protectedRoles = u.authRoles.filter((r) => !assignableRoles.includes(r))
            const availableRoles = assignableRoles.filter((r) => !u.authRoles.includes(r))

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
                    <div>
                      <span className="font-medium">{u.display_name}</span>
                      {!isLinked && (
                        <span className="badge badge-ghost badge-xs ml-2">unlinked</span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge badge-sm badge-outline">{u.role}</span>
                </td>
                <td>
                  {isLinked ? (
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
                            <RemoveRoleButton key={role} userId={u.user_id!} role={role} onResult={handleResult} />
                          ))}

                      {!isSelf && availableRoles.length > 0 && (
                        <Menu as="div" className="relative inline-block">
                          <MenuButton
                            className="badge badge-sm badge-dash cursor-pointer hover:badge-success"
                            aria-label="Add role"
                          >
                            +
                          </MenuButton>
                          <MenuItems
                            anchor="bottom end"
                            modal={false}
                            transition
                            className="z-50 mt-2 w-40 origin-top-right rounded-box bg-base-200 shadow-lg ring-1 ring-base-300 transition duration-100 ease-out [--anchor-gap:0.5rem] data-[closed]:scale-95 data-[closed]:opacity-0"
                          >
                            <div className="p-2">
                              {availableRoles.map((role) => (
                                <AddRoleButton key={role} userId={u.user_id!} role={role} onResult={handleResult} />
                              ))}
                            </div>
                          </MenuItems>
                        </Menu>
                      )}

                      {isSelf && <span className="text-xs italic text-base-content/50 ml-1">(you)</span>}
                    </div>
                  ) : (
                    <span className="text-xs text-base-content/50">No auth account</span>
                  )}
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
