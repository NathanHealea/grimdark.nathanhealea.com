'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Cog6ToothIcon, ChevronDownIcon } from '@heroicons/react/24/solid'
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

      <MenuItems
        anchor="bottom end"
        modal={false}
        transition
        className="z-50 mt-2 w-52 origin-top-right rounded-box bg-base-200 shadow-lg ring-1 ring-base-300 transition duration-100 ease-out [--anchor-gap:0.5rem] data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        <div className="p-2">
          {links.map((link) => (
            <MenuItem key={link.href}>
              <Link
                href={link.href}
                className={`btn btn-ghost block w-full rounded-btn px-3 py-2 text-left text-sm data-[focus]:bg-base-300${link.className ? ` ${link.className}` : ''}`}
              >
                {link.label}
              </Link>
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  )
}
