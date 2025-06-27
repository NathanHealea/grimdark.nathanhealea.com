import { createClient } from '@/lib/supabase/server'

export default async function UsersRoutesLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // If no user is found, redirect to the login page
    return (
      <main className="flex-1 flex min-h-screen flex-col items-center justify-center -mt-20 pt-20">
        <div className="flex flex-col flex-1 items-center justify-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p>You must be logged in to access this page.</p>
        </div>
      </main>
    )
  }

  const roles = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user?.id)
    .then(({ data, error }) => data?.map((item) => item.role))

  // Check if the user has the 'admin' role
  if (!roles || (!roles.includes('admin') && !roles.includes('superadmin'))) {
    // If not an admin, redirect to the dashboard
    return (
      <main className="flex-1 flex min-h-screen flex-col items-center justify-center -mt-20 pt-20">
        <div className="flex flex-col flex-1 items-center justify-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p>You do not have permission to access this page.</p>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
