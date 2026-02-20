'use client'

import { CloseButton, Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useState } from 'react'

type NavLink = {
  href: string
  label: string
}

type MobileNavProps = {
  links: NavLink[]
  isAuthenticated: boolean
  profileId?: number
  signOutAction?: () => Promise<void>
}

export default function MobileNav({ links, isAuthenticated, profileId, signOutAction }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button className="btn btn-ghost" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
        {open ? <XMarkIcon className="size-6" /> : <Bars3Icon className="size-6" />}
      </button>

      <Dialog open={open} onClose={setOpen} className="lg:hidden">
        <DialogPanel className="fixed inset-x-0 top-[4rem] bottom-0 z-40 bg-base-200 transition duration-200 ease-out data-[closed]:opacity-0">
          <ul className="menu w-full gap-1 p-4 text-base">
            {links.map((link) => (
              <li key={link.href}>
                <CloseButton as={Link} href={link.href}>
                  {link.label}
                </CloseButton>
              </li>
            ))}

            <div className="divider my-1" />

            {isAuthenticated ? (
              <>
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
                  <form action={signOutAction}>
                    <CloseButton as="button" type="submit">
                      Sign Out
                    </CloseButton>
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
