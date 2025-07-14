import UserArmyForm from '@/components/forms/UserArmy'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import editProfileFormAction from './action'
import EditProfileForm from './form'
import UserProfilePictureForm from '@/components/forms/UserProfilePictureForm';

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ message: string; status: string }>
}) {
  const { message, status } = await searchParams

  const supabase = await createClient()

  const {
    data: { user: currentUser },
    error: currentUserError,
  } = await supabase.auth.getUser()

  // Handle errors when fetching the current user
  // If there is an error, log it and return an error message
  if (currentUserError) {
    console.error('Error fetching current user:', currentUserError.message)

    return (
      <main className="flex-1 flex min-h-screen flex-col gap-4 p-8 -mt-20 pt-28 ">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-sm text-red-500">Failed to fetch current user: {currentUserError.message}</p>
      </main>
    )
  }

  // Check if the user is logged in
  // If not, redirect to the login page with an error message
  if (!currentUser) {
    redirect('/login?message=You must be logged in to view this page&status=error')
  }

  const { data: userProfile, error: userProfileError } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', currentUser.id)
    .single()

  // Handle errors when fetching the user profile
  // If there is an error, log it and return an error message
  if (userProfileError) {
    console.error('Error fetching user profile:', userProfileError.message)

    return (
    <main className="flex min-h-screen flex-col gap-8 p-8 pt-24">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-sm text-red-500">Failed to fetch user profile: {userProfileError.message}</p>
      </main>
    )
  }

  // If the user profile is not found, return an error message
  if (!userProfile) {
    return (
    <main className="flex min-h-screen flex-col gap-8 p-8 pt-24">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-sm text-red-500">Failed to fetch user profile.</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col gap-8 p-8 pt-24">
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
          <UserProfilePictureForm userId={userProfile.id} />
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
