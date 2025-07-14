'use client'
import { LogoutButton } from '@/components/buttons'
import useTailwindBreakpoints from '@/hooks/useTailwindBreakPoints'
import { User } from '@/types/user.type'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export interface MobileNavigationProps {
  user: User | null
}

export default function MobileNavigation(props: MobileNavigationProps) {
  const { user } = props

  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const isMd = useTailwindBreakpoints('md')

  // Handlers for opening and closing the mobile navigation
  const handleOnOpen = () => setIsOpen(true)
  const handleOnClose = () => setIsOpen(false)

  const handleNavigate = (href: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    window.location.href = href // Navigate to the specified href
    router.push(href) // Use Next.js router to navigate
    handleOnClose() // Close the mobile navigation when a link is clicked
  }

  // Toggle the mobile navigation state
  const handleOnClick = () => {
    if (isOpen) {
      handleOnClose()
    } else {
      handleOnOpen()
    }
  }

  useEffect(() => {
    if (isOpen) {
      // Lock scroll
      document.body.style.overflow = 'hidden'
    } else {
      // Unlock scroll
      document.body.style.overflow = 'auto'
    }

    return () => {
      // Cleanup
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (isMd) {
    return null // Hide mobile navigation on medium and larger screens
  }

  return (
    <>
      <button className="btn btn-ghost  btn-square" type="button" onClick={handleOnOpen}>
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

      {/* Mobile Navigation */}
      <div
        className={`absolute top-0 left-0 bg-base-100 shadow-lg z-50 w-full h-screen ${isOpen ? 'flex flex-col' : 'hidden'}`}
      >
        {/* Navigation - Header */}
        <div className="navbar pr-6">
          <button type="button" className="btn btn-ghost text-xl" onClick={handleNavigate('/')}>
            Grimdark League
          </button>
          <div className="flex-1" />
          <button className="btn btn-ghost btn-square" type="button" onClick={handleOnClose}>
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

        {/* Navigation - Content */}
        <div className="p-4 flex-1 flex flex-col items-center">
          {/* Main Navigation Links */}
          <div className="flex-1 w-full">
            <ul className="menu menu-compact w-full gap-4">
              <li>
                <button type="button" className="btn btn-ghost" onClick={handleNavigate('/')}>
                  Home
                </button>
              </li>
              {!user && (
                <>
                  <li>
                    <button type="button" className="btn btn-ghost" onClick={handleNavigate('/register')}>
                      Register
                    </button>
                  </li>
                  <li>
                    <button type="button" className="btn btn-primary" onClick={handleNavigate('/login')}>
                      Login
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* User Profile Section */}
          {user && (
            <>
              <div className="divider w-full my-4" />
              <div className="flex flex-col justify-center items-center gap-2 w-full">
                <div className="max-h-32 max-w-32 w-full h-full rounded-full overflow-hidden">
                  {user.profile_picture_url ? (
                    <Image
                      src={user.profile_picture_url}
                      alt="Profile Picture"
                      width={128}
                      height={128}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-base-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-32"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <ul className="menu menu-compact w-full gap-4">
                  <li>
                    <button type="button" className="btn btn-primary" onClick={handleNavigate('/dashboard')}>
                      Dashboard
                    </button>
                  </li>
                  <li>
                    <button type="button" className="btn btn-ghost" onClick={handleNavigate('/profile')}>
                      Profile
                    </button>
                  </li>
                  <li>
                    <LogoutButton onClick={handleOnClose} />
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Navigation - Footer */}
        <div className="flex flex-col justify-center items-center  py-4 bg-base-200">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Grimdark League</p>
          <p className="text-sm text-gray-500 text-center text-wrap">
            Forged in the grim darkness of the far future 🌌, crafted{' '}
            <a className="link-primary" href="https://nathanhealea.com" target="_blank" rel="noopener noreferrer">
              by Nathan Healea
            </a>{' '}
            🛠️.
          </p>
        </div>
      </div>
    </>
  )
}
