'use client'

import UserProfileLink from '@/components/navigations/UserProfileLink';
import useTailwindBreakpoints from '@/hooks/useTailwindBreakPoints'
import { User } from '@/types/user.type';
import Image from 'next/image'
import Link from 'next/link'

export interface MainNavigationProps {
  user: User | null
}

export default function MainNavigation(props: MainNavigationProps) {
  const { user } = props

  const isMd = useTailwindBreakpoints('md')

  if (!isMd) {
    return null
  }
  return (
    <div className="flex items-center gap-2">
      <ul className="menu menu-horizontal gap-2 hidden sm:flex">
        <li>
          <Link href="/" className="btn btn-ghost">
            Home
          </Link>
        </li>
        {!user && (
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
      {user && (<UserProfileLink user={user} />)}
      
    </div>
  )
}
