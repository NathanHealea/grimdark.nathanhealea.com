import UserArmyForm from '@/components/forms/UserArmy'
import editUserFormAction from './action'
import EditUserForm from './form'

import UserProfilePictureForm from '@/components/forms/UserProfilePictureForm'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import UserAuthRoleForm from '@/components/forms/UserAuthRoleForm';

export default async function EditUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: number }>
  searchParams: Promise<{ userId: number; message: string; status: string }>
}) {
  const { userId } = await params
  const { message, status } = await searchParams

  if (!userId) {
    return (
    <main className="flex min-h-screen flex-col gap-8 p-8 pt-24">
        <h1 className="text-3xl font-bold">Edit User</h1>
        <p className="text-error">No user ID provided.</p>
      </main>
    )
  }

  const supabase = await createClient()
  const { data: user, error: userError } = await supabase.from('users').select('*').eq('id', userId).single()

  if (userError) {
    return (
    <main className="flex min-h-screen flex-col gap-8 p-8 pt-24">
        <h1 className="text-3xl font-bold">Edit User</h1>
        <p className="text-error">User not found.</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col gap-8 p-8 pt-24">
      {/* Header */}
      <header className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
        {/* Header - Content */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Edit {user.username || 'User'}</h1>
          <p className="text-sm">You are editing {user.username || 'user'} information.</p>
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <Link href="/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link href="/users">Users</Link>
              </li>
              <li>{user.username ? <span>{user.username}</span> : <span>User ID: {userId}</span>}</li>
            </ul>
          </div>
        </div>

        {/* Header - Actions */}
        <div className="flex md:justify-end gap-2">
          <Link href={`/users/delete/${userId}`} className="btn btn-error">
            Delete User
          </Link>
        </div>
      </header>

      {/* <section>
        <div className="container mx-auto flex flex-col gap-4">
          <UserProfilePictureForm userId={user.id} />
          <UserEditForm action={editUserFormAction} user={user}></UserEditForm>
          <UserAuthRoleForm userId={user.user_id} />
            <UserArmyForm userId={user.id} />
        </div>
      </section> */}

      {/* Edit Profile Form */}
      <section>
        <div className="container mx-auto flex flex-col gap-4">
          {/* Edit User Action - Error  */}
          {status === 'error' && (
            <div role="alert" className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{message ? message : 'Unknown error occurred'}</span>
            </div>
          )}

          {/* Edit User Action - Success */}
          {status === 'success' && (
            <div role="alert" className="alert alert-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{message ? message : 'Profile was sucesfully saved.'}</span>
            </div>
          )}
          <UserProfilePictureForm userId={user.id} />
          <EditUserForm action={editUserFormAction} user={user} />
        </div>
      </section>

      {/* Edit Armies Form */}
      <section>
        <div className="container mx-auto ">
          <div className="card bg-base-200 shadow-md p-4">
            <div className="card-body">
              <h2 className="card-title">Roles</h2>
              <p className="text-sm">Manage {user.username}&apos;s roles here.</p>
              <UserAuthRoleForm userId={user.user_id} />
            </div>
          </div>
        </div>
      </section>

      {/* Edit Armies Form */}
      <section>
        <div className="container mx-auto ">
          <div className="card bg-base-200 shadow-md p-4">
            <div className="card-body">
              <h2 className="card-title">Armies</h2>
              <p className="text-sm">Manage {user.username}&apos;s armies here.</p>
              <UserArmyForm userId={user.id} />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
