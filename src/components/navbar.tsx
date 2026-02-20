import { signOut } from '@/app/(auth)/actions'
import { getAuthUser } from '@/lib/supabase/auth'
import { hasRole } from '@/lib/supabase/roles'
import { publicLinks, memberLinks, adminLinks } from '@/routes'
import Link from 'next/link'
import MobileNav from './mobile-nav'
import UserMenu from './user-menu'

export default async function Navbar() {
  const auth = await getAuthUser({ withProfile: true })
  const user = auth?.user ?? null
  const profile = auth ? auth.profile : null

  const isAdmin = user ? await hasRole(user.id, 'admin') : false
  const isMember = user ? isAdmin || (await hasRole(user.id, 'member')) : false
  const navLinks = [
    ...publicLinks,
    ...(isMember ? memberLinks : []),
    ...(isAdmin ? adminLinks : []),
  ]

  return (
    <nav className="navbar bg-base-100/90 backdrop-blur-md border-b border-base-300 sticky top-0 z-50">
      <div className="navbar-start">
        <MobileNav links={navLinks} isAuthenticated={!!user} profileId={profile?.profile_id} signOutAction={signOut} />
        <Link href="/" className="btn btn-ghost text-xl">
          <span className="font-bold tracking-widest text-primary text-sm uppercase">
            Grimdark<span className="text-base-content font-light ml-1">League</span>
          </span>
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex gap-4">
        <ul className="menu menu-horizontal px-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="navbar-end hidden lg:flex gap-4">
        {user ? (
          <UserMenu
            profileId={profile?.profile_id}
            avatarUrl={profile?.avatar_url}
            displayName={profile?.display_name}
            signOutAction={signOut}
          />
        ) : (
          <>
            <Link href="/sign-in" className="btn btn-outline btn-primary btn-sm hidden sm:flex">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn btn-primary btn-sm">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
