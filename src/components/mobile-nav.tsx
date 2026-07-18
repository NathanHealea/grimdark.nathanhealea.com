'use client'

import { CloseButton, Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useState } from 'react'

import type { NavLink } from '@/routes'

type MobileNavProps = {
  links: NavLink[]
  adminLinks?: NavLink[]
  isAuthenticated: boolean
  profileId?: number
  signOutAction?: () => Promise<void>
}

export default function MobileNav({
  links,
  adminLinks = [],
  isAuthenticated,
  profileId,
  signOutAction,
}: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button className="btn btn-ghost" onClick={() => setOpen(true)} aria-label="Open menu">
        <Bars3Icon className="size-6" />
      </button>

      <Dialog open={open} onClose={setOpen} className="lg:hidden">
        <DialogPanel className="bg-popover fixed inset-x-0 top-0 bottom-0 z-[60] transition duration-200 ease-out data-[closed]:opacity-0">
          <div className="border-border flex h-16 items-center border-b px-4">
            <button className="btn btn-ghost" onClick={() => setOpen(false)} aria-label="Close menu">
              <XMarkIcon className="size-6" />
            </button>
            <CloseButton as={Link} href="/" className="btn btn-ghost ml-2 p-0">
              <span className="nav-brand">
                Grimdark<span className="nav-brand-accent">League</span>
              </span>
            </CloseButton>
          </div>

          <ul className="menu w-full gap-1 p-4 text-base">
            {links.map((link) => (
              <li key={link.href}>
                <CloseButton as={Link} href={link.href} className={link.className}>
                  {link.label}
                </CloseButton>
              </li>
            ))}

            {adminLinks.length > 0 && (
              <>
                <div className="divider" />
                <li className="menu-title">Admin</li>
                {adminLinks.map((link) => (
                  <li key={link.href}>
                    <CloseButton as={Link} href={link.href} className={link.className}>
                      {link.label}
                    </CloseButton>
                  </li>
                ))}
              </>
            )}

            <div className="divider" />

            {isAuthenticated ? (
              <>
                <li className="menu-title">Battle Reports</li>
                <li>
                  <CloseButton as={Link} href={`/battle-reports/drafts`}>
                    My Drafts
                  </CloseButton>
                </li>
                <div className="divider" />

                <li className="menu-title">Profile</li>
                {profileId && (
                  <li>
                    <CloseButton as={Link} href={`/profile/${profileId}`}>
                      My Profile
                    </CloseButton>
                  </li>
                )}
                <li>
                  <CloseButton as={Link} href="/profile/edit">
                    Edit Profile
                  </CloseButton>
                </li>
                <li className="bg-destructive rounded-md">
                  <form
                    action={async () => {
                      setOpen(false)
                      await signOutAction?.()
                    }}
                  >
                    <button
                      type="submit"
                      className="text-destructive-foreground w-full rounded-md px-4 py-2 text-left text-sm font-medium"
                    >
                      Sign Out
                    </button>
                  </form>
                </li>
              </>
            ) : (
              <>
                <li>
                  <CloseButton as={Link} href="/sign-in">
                    Sign In
                  </CloseButton>
                </li>
                <li>
                  <CloseButton as={Link} href="/sign-up" className="btn btn-primary">
                    Sign Up
                  </CloseButton>
                </li>
              </>
            )}
          </ul>
        </DialogPanel>
      </Dialog>
    </div>
  )
}
