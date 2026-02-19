import { getAuthUser } from '@/lib/supabase/auth'
import Link from 'next/link'
import { signOut } from '@/app/(auth)/actions'
import UserMenu from './user-menu'

export default async function Navbar() {
  const auth = await getAuthUser({ withProfile: true })
  const user = auth?.user ?? null
  const profile = auth ? auth.profile : null

  return (
    <nav className="navbar sticky top-0 z-40 bg-base-200">
      <div className="flex-1 gap-2">
        <Link href="/" className="btn btn-ghost text-xl">
          Grimdark League
        </Link>
        <Link href="/members" className="btn btn-ghost btn-sm">
          Members
        </Link>
      </div>
      <div className="flex gap-2">
        {user ? (
          <UserMenu
            profileId={profile?.profile_id}
            avatarUrl={profile?.avatar_url}
            displayName={profile?.display_name}
            signOutAction={signOut}
          />
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
