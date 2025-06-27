import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // If no user is found, redirect to the login page
    redirect('/login')
  }

  return (
    <>
      <div className="flex flex-1">
        <aside
          id="sidebar"
          className="w-64 bg-base-100 p-4 flex flex-col transform -translate-x-full lg:translate-x-0 transition-transform duration-200 ease-in-out fixed min-h-[calc(100vh-4.5rem)] inset-y-0 left-0 z-20 lg:relative lg:block lg:border-r lg:border-base-200"
        >
          <div className="flex items-center justify-between ">
            {/* Close Button */}
            <button className="lg:hidden text-white focus:outline-none" id="closeSidebar">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            <ul className="menu w-full">
              <li className="menu-item">
                <Link href="/dashboard" className="btn btn-ghost justify-start">
                  <div className="h-6 w-6 mr-3 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                      />
                    </svg>
                  </div>
                  Dashboard
                </Link>
              </li>
              <li className="menu-item">
                <Link href="/profile" className="btn btn-ghost justify-start">
                  <div className="h-6 w-6 mr-3 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  </div>
                  Profile
                </Link>
              </li>

              <li className="menu-item">
                <p className="menu-title">Administration</p>

                <ul className="menu w-full">
                  <li className="menu-item">
                    <Link href="/users" className="btn btn-ghost justify-start">
                      <div className="h-6 w-6 mr-3 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                          />
                        </svg>
                      </div>
                      Users
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </aside>

        {children}
      </div>
    </>
  )
}
