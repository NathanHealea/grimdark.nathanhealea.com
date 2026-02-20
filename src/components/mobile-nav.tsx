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

export default function MobileNav({ links, adminLinks = [], isAuthenticated, profileId, signOutAction }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button className="btn btn-ghost" onClick={() => setOpen(true)} aria-label="Open menu">
        <Bars3Icon className="size-6" />
      </button>

      <Dialog open={open} onClose={setOpen} className="lg:hidden">
        <DialogPanel className="fixed inset-x-0 top-0 bottom-0 z-[60] bg-base-200 transition duration-200 ease-out data-[closed]:opacity-0">
          <div className="flex items-center  border-b border-base-300 px-4 h-16">
            <button className="btn btn-ghost" onClick={() => setOpen(false)} aria-label="Close menu">
              <XMarkIcon className="size-6" />
            </button>
            <CloseButton as={Link} href="/" className="btn btn-ghost ml-2 p-0">
              <span className="font-bold tracking-widest text-primary text-sm uppercase">
                Grimdark<span className="text-base-content font-light ml-1">League</span>
              </span>
            </CloseButton>
          </div>

          <ul className="menu w-full gap-1 p-4 text-base">
            {links.map((link) => (
              <li key={link.href}>
                <CloseButton as={Link} href={link.href}>
                  {link.label}
                </CloseButton>
              </li>
            ))}

            {adminLinks.length > 0 && (
              <>
                <div className="divider my-1" />
                <li className="menu-title text-xs font-semibold uppercase tracking-widest text-primary">Admin</li>
                {adminLinks.map((link) => (
                  <li key={link.href}>
                    <CloseButton as={Link} href={link.href}>
                      {link.label}
                    </CloseButton>
                  </li>
                ))}
              </>
            )}

            <div className="divider my-1" />

            {isAuthenticated ? (
              <>
                <li className="menu-title text-xs font-semibold uppercase tracking-widest text-primary">Profile</li>
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
                <li className="rounded-md bg-error">
                  <form
                    action={async () => {
                      setOpen(false)
                      await signOutAction?.()
                    }}
                  >
                    <button type="submit">Sign Out</button>
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
                  <CloseButton as={Link} href="/sign-up" className="btn btn-primary text-primary-content">
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
