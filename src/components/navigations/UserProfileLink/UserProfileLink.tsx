'use client'

import { LogoutButton } from '@/components/buttons'
import { User } from '@/types/user.type';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import Image from 'next/image'
import Link from 'next/link'

export type UserProfileLinkProps = {
  user: User
}

export default function UserProfileLink(props: UserProfileLinkProps) {
  const { user } = props

  return (
    <Menu as="div" className="dropdown">
      <MenuButton className="btn btn-ghost rounded-full">
        {user.profile_picture_url && (
          <Image
            width={32}
            height={32}
            src={user.profile_picture_url}
            alt="User Profile Picture"
            className="w-8 h-8 "
          />
        )}
      </MenuButton>
      <MenuItems
        anchor="bottom end"
        as="ul"
        className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52  border-none"
      >
        <MenuItem as="li">
        {({close}) => (
          <Link href="/dashboard" className="btn btn-ghost" onClick={close}>
            Dashboard
          </Link>
        )}
        </MenuItem>
        <MenuItem as="li">
          {({close}) => (
          <Link href="/profile" className="btn btn-ghost" onClick={close}>
            Profile
          </Link>
        )}
        </MenuItem>
        <MenuItem as="li">
          <LogoutButton />
        </MenuItem>
      </MenuItems>
    </Menu>
  )
}
