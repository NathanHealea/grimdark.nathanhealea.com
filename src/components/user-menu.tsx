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

      <MenuItems anchor="bottom end" modal={false} transition className="menu-dropdown w-60">
        <div className="menu-dropdown-body">
          <MenuItem>
            <Link href={`/battle-reports/drafts`} className="menu-item">
              My Drafts
            </Link>
          </MenuItem>
          {profileId && (
            <MenuItem>
              <Link href={`/profile/${profileId}`} className="menu-item">
                My Profile
              </Link>
            </MenuItem>
          )}
          <MenuItem>
            <Link href="/profile/edit" className="menu-item">
              Edit Profile
            </Link>
          </MenuItem>
          <MenuItem>
            <form action={signOutAction}>
              <button type="submit" className="menu-item menu-item-danger">
                Sign Out
              </button>
            </form>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  )
}
