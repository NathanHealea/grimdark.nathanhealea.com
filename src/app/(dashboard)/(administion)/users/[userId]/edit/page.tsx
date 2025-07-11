import UserAuthRoleForm from '@/components/forms/UserAuthRoleForm'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import editUserFormAction from './action'
import UserEditForm from './form'
import UserArmyForm from '@/components/forms/UserArmy';
import UserProfilePictureForm from '@/components/forms/UserProfilePictureForm';

export default async function EditUserPage({ params }: { params: Promise<{ userId: number }> }) {
  const { userId } = await params

  if (!userId) {
    return (
      <main className="flex-1 flex min-h-screen flex-col gap-4 p-8 -mt-20 pt-28">
        <h1 className="text-3xl font-bold">Edit User</h1>
        <p className="text-error">No user ID provided.</p>
      </main>
    )
  }

  const supabase = await createClient()
  const { data: user, error: userError } = await supabase.from('users').select('*').eq('id', userId).single()

  if (userError) {
    return (
      <main className="flex-1 flex min-h-screen flex-col gap-4 p-8 -mt-20 pt-28">
        <h1 className="text-3xl font-bold">Edit User</h1>
        <p className="text-error">User not found.</p>
      </main>
    )
  }

  return (
    <main className="flex-1 flex min-h-screen flex-col gap-4 p-8 -mt-20 pt-28">
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

      <section>
        <div className="container mx-auto">
          <UserProfilePictureForm userId={user.id} />
          <UserEditForm action={editUserFormAction} user={user}>
            <UserAuthRoleForm userId={user.user_id} />
            <UserArmyForm userId={user.id} />
          </UserEditForm>
        </div>
      </section>
    </main>
  )
}
