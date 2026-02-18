import { getAuthUser } from '@/lib/supabase/auth'
import Link from 'next/link'
import { signOut } from '@/app/(auth)/actions'

export default async function Navbar() {
  const auth = await getAuthUser({ withProfile: true })
  const user = auth?.user ?? null
  const profile = auth ? auth.profile : null

  return (
    <nav className="navbar bg-base-200">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">
          Grimdark League
        </Link>
      </div>
      <div className="flex gap-2">
        {user ? (
          <>
            {profile && (
              <Link href={`/profile/${profile.profile_id}`} className="btn btn-ghost">
                My Profile
              </Link>
            )}
            <Link href="/profile/edit" className="btn btn-ghost">
              Edit Profile
            </Link>
            <form action={signOut}>
              <button type="submit" className="btn btn-outline btn-error">
                Sign Out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/sign-in" className="btn btn-ghost">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn btn-primary">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
