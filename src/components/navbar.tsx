import { getAuthUser } from '@/lib/supabase/auth'
import { hasRole } from '@/lib/supabase/roles'
import Link from 'next/link'
import { signOut } from '@/app/(auth)/actions'
import MobileNav from './mobile-nav'
import UserMenu from './user-menu'

const publicLinks = [{ href: '/members', label: 'Members' }]
const memberLinks = [{ href: '/battle-reports/submit', label: 'Submit Battle Report' }]

export default async function Navbar() {
  const auth = await getAuthUser({ withProfile: true })
  const user = auth?.user ?? null
  const profile = auth ? auth.profile : null

  const isMember = user ? await hasRole(user.id, 'member') || await hasRole(user.id, 'admin') : false
  const navLinks = isMember ? [...publicLinks, ...memberLinks] : publicLinks

  return (
    <nav className="navbar sticky top-0 z-40 bg-base-200">
      <div className="navbar-start">
        <MobileNav
          links={navLinks}
          isAuthenticated={!!user}
          profileId={profile?.profile_id}
          signOutAction={signOut}
        />
        <Link href="/" className="btn btn-ghost text-xl">
          Grimdark League
        </Link>
      </div>
      <div className="navbar-end hidden lg:flex gap-4">
        <ul className="menu menu-horizontal px-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
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
