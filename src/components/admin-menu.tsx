'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon, Cog6ToothIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

import type { NavLink } from '@/routes'

type AdminMenuProps = {
  links: NavLink[]
}

export default function AdminMenu({ links }: AdminMenuProps) {
  return (
    <Menu as="div" className="relative">
      <MenuButton className="btn btn-ghost gap-1 text-sm">
        <Cog6ToothIcon className="size-5" />
        Admin
        <ChevronDownIcon className="size-4" />
      </MenuButton>

      <MenuItems anchor="bottom end" modal={false} transition className="menu-dropdown w-52">
        <div className="menu-dropdown-body">
          {links.map((link) => (
            <MenuItem key={link.href}>
              <Link href={link.href} className={`menu-item${link.className ? ` ${link.className}` : ''}`}>
                {link.label}
              </Link>
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  )
}
