'use client'

import Avatar from '@/components/avatar'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

type UserMenuProps = {
  profileId?: number
  avatarUrl?: string | null
  displayName?: string
  signOutAction: () => Promise<void>
}

export default function UserMenu({ profileId, avatarUrl, displayName, signOutAction }: UserMenuProps) {
  return (
    <Menu as="div" className="relative">
      <MenuButton className="btn btn-ghost btn-circle">
        {displayName ? (
          <Avatar src={avatarUrl ?? null} displayName={displayName} size="sm" />
        ) : (
          <UserCircleIcon className="size-6" />
        )}
      </MenuButton>

      <MenuItems
        anchor="bottom end"
        modal={false}
        transition
        className="z-50 mt-2 w-60 origin-top-right rounded-box bg-base-200 shadow-lg ring-1 ring-base-300 transition duration-100 ease-out [--anchor-gap:0.5rem] data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        <div className="p-2">
          <MenuItem>
            <Link
              href={`/battle-reports/drafts`}
              className="btn btn-ghost block w-full rounded-btn px-3 py-2 text-left text-sm data-[focus]:bg-base-300"
            >
              My Drafts
            </Link>
          </MenuItem>
          {profileId && (
            <MenuItem>
              <Link
                href={`/profile/${profileId}`}
                className="btn btn-ghost block w-full rounded-btn px-3 py-2 text-left text-sm data-[focus]:bg-base-300"
              >
                My Profile
              </Link>
            </MenuItem>
          )}
          <MenuItem>
            <Link
              href="/profile/edit"
              className="btn btn-ghost block w-full rounded-btn px-3 py-2 text-left text-sm data-[focus]:bg-base-300"
            >
              Edit Profile
            </Link>
          </MenuItem>
          <MenuItem>
            <form action={signOutAction}>
              <button type="submit" className="btn btn-error block w-full rounded-btn px-3 py-2 text-left text-sm ">
                Sign Out
              </button>
            </form>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  )
}
