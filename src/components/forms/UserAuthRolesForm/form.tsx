'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import roleFormAction from './actions'
import { Role, UserAuthRoleState } from './types'

interface UserAuthRoleProps {
  userId: string | null
}

export default function UserAuthRolesForm(props: UserAuthRoleProps) {
  const { userId } = props

  const [selectedRole, setSelectedRole] = useState<string>('')

  const [userAuthRoles, setUserAuthRoles] = useState<Role[]>([])
  const [loadingUserAuthRoles, setLoadingUserAuthRoles] = useState<boolean>(true)

  const [state, setState] = useState<UserAuthRoleState>({} as UserAuthRoleState)

  const supabase = createClient()

  // Helper function to fetch user roles from the database
  const fetchUserAuthRoles = async () => {
    try {
      setLoadingUserAuthRoles(true)
      if (!userId) {
        throw new Error('User ID is required to fetch roles.')
      }

      const { data, error } = await supabase
        .from('user_auth_roles')
        .select('*')
        .eq('user_id', userId)
        .order('role', { ascending: false })
        .overrideTypes<Role[]>()

      // throw the error from the database query
      if (error) {
        throw error
      }

      // throw an error if no roles are found
      if (!data || data.length === 0) {
        throw new Error(`No roles found for user id: ${userId}.`)
      }

      setUserAuthRoles(data)
    } catch (error) {
      setUserAuthRoles([])
    } finally {
      setLoadingUserAuthRoles(false)
    }
  }

  // Initialize user roles from the userId prop
  useEffect(() => {
    if (state.success == true) {
      fetchUserAuthRoles()
      // Reset state after successful action
      setState({} as UserAuthRoleState)
      setSelectedRole('')
    }
  }, [state])

  useEffect(() => {
    // Fetch user roles when the component mounts or userId changes
    fetchUserAuthRoles()
  }, [])

  // Handles role selection change.
  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value)
  }

  // Handles adding a new role to the user.
  const handleAddRole = async () => {
    const formData = new FormData()
    formData.append('userId', userId || '')
    formData.append('role', selectedRole)
    formData.append('action', 'add')

    const newState = await roleFormAction(state, formData)
    setState(newState)
    setSelectedRole('')
  }

  // Handles removing a role from the user.
  const handleRemoveRole = (role: string) => async () => {
    const formData = new FormData()
    formData.append('userId', userId || '')
    formData.append('role', role)
    formData.append('action', 'remove')

    const newState = await roleFormAction(state, formData)
    setState(newState)
    setSelectedRole('')
  }

  // Returns error message if no userId is provided.
  if (!userId) {
    return (
      <div className="flex flex-col gap-4">
        {/* Roles Input Wrapper */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="roles" className={`label ${state.errors?.roles ? 'text-error' : ''}`}>
            <span className="label-text">User Roles</span>
          </label>
          <div className="text-error">
            <p>User does not have an auntenticed user Id. Roles cannot be assigned.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Roles Input Wrapper */}
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="roles" className={`label ${state.errors?.roles ? 'text-error' : ''}`}>
          <span className="label-text">User Roles</span>
        </label>
        {/* Role Search */}
        <div className="flex gap-2">
          <select
            id="roles"
            name="role"
            className={`select select-bordered w-full ${state.errors?.roles ? 'select-error' : ''}`}
            value={selectedRole}
            onChange={handleRoleChange}
          >
            <option value="" disabled>
              Select a role
            </option>
            {/* <option value="superadmin">Superadmin</option> */}
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <button type="button" className="btn btn-primary" onClick={handleAddRole}>
            Add Role
          </button>
        </div>
        {/* Roles Errors */}
        {state.errors?.form && (
          <ul className="list text-error">
            {state.errors.form.map((error, index) => (
              <li className="list-row" key={index}>
                {error}
              </li>
            ))}
          </ul>
        )}
        {state.errors?.roles && (
          <ul className="list text-error">
            {state.errors.roles.map((error, index) => (
              <li className="list-row" key={index}>
                {error}
              </li>
            ))}
          </ul>
        )}
        {/* Roles List */}
        <ul className="list">
          {loadingUserAuthRoles && (
            <li className="list-row">
              <p className="text-sm text-gray-500">
                Loading user roles <span className="loading loading-dots loading-xs" />
              </p>
            </li>
          )}
          {userAuthRoles.length === 0 && !loadingUserAuthRoles && (
            <li className="list-row">
              <p className="text-sm text-gray-500">No user roles found. Please add a role using the form above.</p>
            </li>
          )}

          {userAuthRoles.map((role, index) => {
            if (role.role === 'superadmin') {
              return (
                <li className="list-row disabled" key={index}>
                  <div>
                    <p className="capitalize">{role.role}</p>
                  </div>
                  <div className="flex-1"></div>
                  <button type="button" className="btn btn-error btn-square" disabled onClick={handleRemoveRole(role.role)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                </li>
              )
            }

            return (
              <li className="list-row" key={index}>
                <div>
                  <p className="capitalize">{role.role}</p>
                </div>
                <div className="flex-1"></div>
                <button type="button" className="btn btn-error btn-square" onClick={handleRemoveRole(role.role)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
