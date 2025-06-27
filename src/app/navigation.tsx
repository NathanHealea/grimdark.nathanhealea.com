import { LogoutButton } from '@/components/buttons'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Navigation() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <Link href="/" className="btn btn-ghost text-xl">
        Grimdark League
      </Link>

      <div className="flex-1" />

      <div className="flex-none">
        <ul className="menu menu-horizontal gap-2">
          <li>
            <Link href="/" className="btn btn-ghost">
              Home
            </Link>
          </li>

          {user ? (
            <>
              <li>
                <Link href="/dashboard" className="btn btn-ghost">
                  Dashboard
                </Link>
              </li>
              <li>
                <LogoutButton />
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/register" className="btn btn-ghost">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/login" className="btn btn-primary">
                  Login
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}
