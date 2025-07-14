'use client'
import useTailwindBreakpoints from '@/hooks/useTailwindBreakPoints';
import { User } from '@/types/user.type';
import { useRouter } from 'next/navigation'

export type SidebarProps = {
  user: User;
  open?: boolean
  onClose?: () => void
}

/**
 * Sidebar component for the dashboard layout.
 * @returns {JSX.Element} The sidebar JSX element.
 * @param {SidebarProps} props - The properties for the sidebar component.
 */
export default function Sidebar(props: SidebarProps) {
  const { user, open, onClose: handleOnClose } = props
  const isMd = useTailwindBreakpoints('md')
  const router = useRouter();

  const handleNavigation = (href: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    router.push(href)

    if (handleOnClose) {
      handleOnClose()
    } 
  }

  return (
    <aside
      id="sidebar"
      className={`fixed top-0 left-0 transform -translate-x-full md:translate-x-0 transition-transform duration-200 ease-in-out inset-y-0 z-20 bg-base-200 md:shadow-lg z-50 md:shadow-base-300 ${open ? 'translate-x-0' : ''}`}
    >
      {/* Sidebar content */}
      <div className="min-h-screen w-64 flex flex-col ">
        <nav className="navbar">
          <div className="flex gap-2">
            {!isMd && (
            <button type="button" className="btn btn-square" onClick={handleOnClose}>
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
            )}

            <button type="button" className="btn btn-ghost normal-case text-xl">
              Grimdark
            </button>
          </div>
        </nav>

        <ul className="menu menu-compact p-2 flex-1 w-full">
          <li>
            <button type="button" onClick={handleNavigation('/dashboard')}>
              Dashboard
            </button>
          </li>
          <li>
            <button type="button" onClick={handleNavigation('/profile')}>
              Profile
            </button>
          </li>
          {/* <li>
            <button type="button"  href="/armies">Battles</button>
            <ul className="menu menu-compact w-full">
              <li>
                <button type="button"  href="/battles/sizes">Sizes</button>
              </li>
            </ul>
          </li> */}
          {user.roles?.some(role => role.role === 'admin' || role.role === 'superadmin') && (
          <li>
            <p className="menu-title">Administration</p>
            <ul className="menu menu-compact w-full">
              <li>
                <button type="button" onClick={handleNavigation('/users')}>
                  Users
                </button>
              </li>
              <li>
                <button type="button" onClick={handleNavigation('/armies')}>
                  Armies
                </button>
              </li>
            </ul>
          </li>
          )}
        </ul>
      </div>
    </aside>
  )
}
