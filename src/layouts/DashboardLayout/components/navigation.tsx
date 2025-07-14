'use client'

import UserProfileLink from '@/components/navigations/UserProfileLink'
import useTailwindBreakpoints from '@/hooks/useTailwindBreakPoints'
import { User } from '@/types/user.type'
import Link from 'next/link'

export type NavigationProps = {
  user: User
  children?: React.ReactNode
  handleOnClose?: () => void
  handleOnOpen?: () => void
}

export default function Navigation(props: NavigationProps) {
  const { user, handleOnOpen } = props
  const isMd = useTailwindBreakpoints('md')

  return (
    <nav className="navbar fixed top-0 left-0 z-50 w-screen bg-base-200  border-left-0 pr-4">
      {!isMd && (
        <div className="flex gap-2">
          <button type="button" className="btn btn-square" onClick={handleOnOpen}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <Link href="/" className="btn btn-ghost normal-case text-xl">
            Grimdark
          </Link>
        </div>
      )}
      <div className="flex-1"></div>
      <div className="navbar-end ">
        <ul className="menu menu-horizontal gap-2">
          <li>
            <Link href="/" className="btn btn-ghost">
              Home
            </Link>
          </li>
          {!user && (
            <>
              <li>
                <Link href="/register" className="btn btn-ghost">
                  register
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
        {user && <UserProfileLink user={user} />}
      </div>
    </nav>
  )
}
