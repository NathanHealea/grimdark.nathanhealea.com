import UserArmyForm from '@/components/forms/UserArmy'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import editProfileFormAction from './action'
import EditProfileForm from './form'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user: currentUser },
    error: currentUserError,
  } = await supabase.auth.getUser()

  if (currentUserError) {
    console.error('Error fetching current user:', currentUserError.message)

    return (
      <main className="flex-1 flex min-h-screen flex-col gap-4 p-8 -mt-20 pt-28 ">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-sm text-red-500">Failed to fetch current user: {currentUserError.message}</p>
      </main>
    )
  }

  if (!currentUser) {
    redirect('/login?message=You must be logged in to view this page&status=error')
  }

  const { data: userProfile, error: userProfileError } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', currentUser.id)
    .single()

  if (userProfileError) {
    console.error('Error fetching user profile:', userProfileError.message)

    return (
      <main className="flex-1 flex min-h-screen flex-col gap-4 p-8 -mt-20 pt-28 ">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-sm text-red-500">Failed to fetch user profile: {userProfileError.message}</p>
      </main>
    )
  }

  if (!userProfile) {
    ;<main className="flex-1 flex min-h-screen flex-col gap-4 p-8 -mt-20 pt-28 ">
      <h1 className="text-2xl font-bold">Error</h1>
      <p className="text-sm text-red-500">Failed to fetch user profile.</p>
    </main>
  }

  return (
    <main className="flex-1 flex min-h-screen flex-col gap-8 p-8 -mt-20 pt-28 ">
      {/* User Action Error  */}

      {/* Header */}
      <header className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
        {/* Header - Content */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{userProfile.username}</h1>
          <p className="text-sm">Manage your profile.</p>
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <Link href="/dashboard">Dashboard</Link>
              </li>
              <li>Profile</li>
            </ul>
          </div>
        </div>

        {/* Header - Actions */}
        {/* <div className="flex md:justify-end gap-2">
          <Link href="/users/create" className="btn btn-primary">
            Create User
          </Link>
        </div> */}
      </header>

      {/* Edit Profile Form */}
      <section>
        <div className="container mx-auto ">
          <EditProfileForm action={editProfileFormAction} user={userProfile} />
        </div>
      </section>

      {/* Edit Armies Form */}
      <section>
        <div className="container mx-auto ">
          <div className="card bg-base-200 shadow-md p-4">
            <div className="card-body">
              <h2 className="card-title">Your Armies</h2>
              <p className="text-sm">Manage your armies here.</p>
              <UserArmyForm userId={userProfile.id} />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
