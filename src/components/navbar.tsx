import { signOut } from '@/app/(auth)/actions'
import { getAuthUser } from '@/lib/supabase/auth'
import { hasAnyRole, hasRole } from '@/lib/supabase/roles'
import { publicLinks, memberLinks, adminLinks, adminOnlyLinks } from '@/routes'
import Link from 'next/link'
import AdminMenu from './admin-menu'
import MobileNav from './mobile-nav'
import UserMenu from './user-menu'

export default async function Navbar() {
  const auth = await getAuthUser({ withProfile: true })
  const user = auth?.user ?? null
  const profile = auth ? auth.profile : null

  const isAdmin = user ? await hasRole(user.id, 'admin') : false
  const hasAdminAccess = isAdmin || (user ? await hasAnyRole(user.id, ['admin', 'organizer']) : false)
  const isMember = profile ? isAdmin || hasAdminAccess || profile.role === 'member' || profile.role === 'organizer' : false
  const navLinks = [
    ...publicLinks,
    ...(isMember ? memberLinks : []),
  ]
  const visibleAdminLinks = isAdmin ? [...adminLinks, ...adminOnlyLinks] : adminLinks

  return (
    <nav className="navbar">
      <div className="navbar-start">
        <MobileNav
          links={navLinks}
          adminLinks={hasAdminAccess ? visibleAdminLinks : []}
          isAuthenticated={!!user}
          profileId={profile?.profile_id}
          signOutAction={signOut}
        />
        <Link href="/" className="btn btn-ghost text-xl">
          <span className="nav-brand">
            Grimdark<span className="nav-brand-accent">League</span>
          </span>
        </Link>
      </div>

      <div className="navbar-center hidden gap-4 lg:flex">
        <ul className="menu menu-horizontal gap-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={link.className}>{link.label}</Link>
            </li>
          ))}
        </ul>
        {hasAdminAccess && <AdminMenu links={visibleAdminLinks} />}
      </div>
      <div className="navbar-end hidden gap-4 lg:flex">
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
