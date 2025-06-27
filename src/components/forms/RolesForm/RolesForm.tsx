'use client'
import { useActionState, useEffect, useState } from 'react'
import roleFormAction from './actions'
import { RolesFormState } from './types'
import { createClient } from '@/lib/supabase/client';

interface RolesFormProps {
  userId?: string
  roles: object[] // Optional, if you want to pre-populate roles
}

export default function RolesForm(props: RolesFormProps) {
  const { userId, roles } = props

  console.log('RolesForm Props:', props)
  // const [state, formAction, isPending] = useActionState(roleFormAction, {} as RolesFormState)
  const supabase = createClient();

  const [selectedRole, setSelectedRole] = useState<string>('')

  const [userRoles, setUserRoles] = useState<object[]>(roles)

  // Initialize user roles from props
  // This will set the initial state of userRoles based on the roles prop
  // and update it whenever roles change.
  useEffect(() => {
    setUserRoles(roles)
  }, [roles])

  const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRole(event.target.value)
  }

  const [state, setState] = useState<RolesFormState>({} as RolesFormState)

  const handleAddRole = async () => {
    if(selectedRole){
      const {data, error} = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: selectedRole })
        .select()
        .single()

      if (error) {
        console.error('Error adding role:', error)
      } else {
        setUserRoles([...userRoles, data])
        setSelectedRole('')
      }
    }
    
  }

  const handleRemoveRole = (role:object) => async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role.role)

    if (error) {
      console.error('Error removing role:', error)
    } else {
      setUserRoles(userRoles.filter(r => r !== role))
    }
  }

  if (!userId) {
    return (
      <div className="text-error">
        <p>No user ID provided. Please select a user to manage roles.</p>
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
          <label className="input w-full">
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input
              type="search"
              className="grow"
              placeholder="Search for roles..."
              list="roles"
              onChange={handleRoleChange}
            />
            <datalist id="roles">
              <option value="user">User</option>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </datalist>
          </label>
          <button type="button" className="btn btn-primary" onClick={handleAddRole} >
            Add Role
          </button>
        </div>
        {/* Roles Errors */}
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
          {userRoles.map((role, index) => (
            <li className="list-row" key={index}>
              <div>
                <p className="capitalize">{role.role}</p>
              </div>
              <div className="flex-1"></div>
              <button type="button" className="btn btn-error btn-square" onClick={handleRemoveRole(role)}>
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
          ))}
        </ul>
      </div>
    </div>
  )
}
