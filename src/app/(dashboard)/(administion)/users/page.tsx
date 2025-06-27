import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string; status: string }>
}) {
  const { message: userActionMessage, status: userActionStatus } = await searchParams

  const supabase = await createClient()

  const { data, error } = await supabase.from('users').select('*').order('id', { ascending: true })

  return (
    <main className="flex-1 flex min-h-screen flex-col gap-4 p-8 -mt-20 pt-28 relative">
      {/* User Action Error  */}
      {userActionStatus === 'error' && (
        <div className="relative top-0 right-0 p-4">
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
            <span>{userActionMessage ? userActionMessage : 'Unknown error occurred'}</span>
          </div>
        </div>
      )}

      {/* User Action Success */}
      {userActionStatus === 'success' && (
        <div className="relative top-0 right-0 p-4">
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
            <span>{userActionMessage ? userActionMessage : 'Action was completed successfully'}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
        {/* Header - Content */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm">Manage your users, roles, and permissions.</p>
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <Link href="/dashboard">Dashboard</Link>
              </li>
              <li>Users</li>
            </ul>
          </div>
        </div>

        {/* Header - Actions */}
        <div className="flex md:justify-end gap-2">
          <Link href="/users/create" className="btn btn-primary">
            Create User
          </Link>
        </div>
      </header>

      <section>
        <div className="container mx-auto">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title">Users</h2>
              <p className="text-sm">List of all users in the system.</p>

              {error && <p className="text-red-500">Error loading users: {error.message}</p>}
              {data && data.length === 0 && <p className="text-gray-500">No users found.</p>}

              {data && data.length !== 0 && (
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.email}</td>
                        <td>{user.roles}</td>
                        <td>{new Date(user.created_at).toLocaleString()}</td>
                        <td>
                          <div className="flex gap-2">
                            <Link href={`/users/edit/${user.id}`} className="btn btn-sm btn-primary">
                              Edit
                            </Link>
                            <Link href={`/users/delete/${user.id}`} className="btn btn-sm btn-error">
                              Delete
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
