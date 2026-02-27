'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

type LinkItem = {
  label: string
  href: string
}

type ButtonItem = {
  label: string
  onClick: () => void
  variant?: 'danger'
}

type ActionItem = LinkItem | ButtonItem

type ActionsMenuProps = {
  items: ActionItem[]
}

function isLinkItem(item: ActionItem): item is LinkItem {
  return 'href' in item
}

export default function ActionsMenu({ items }: ActionsMenuProps) {
  return (
    <Menu as="div" className="relative">
      <MenuButton className="btn btn-ghost btn-xs">
        <EllipsisHorizontalIcon className="w-4 h-4" />
      </MenuButton>

      <MenuItems
        anchor="bottom end"
        modal={false}
        transition
        className="z-50 mt-2 w-48 origin-top-right rounded-box bg-base-200 shadow-lg ring-1 ring-base-300 transition duration-100 ease-out [--anchor-gap:0.5rem] data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        <div className="p-2">
          {items.map((item, i) => (
            <MenuItem key={isLinkItem(item) ? item.href : `action-${i}`}>
              {isLinkItem(item) ? (
                <Link
                  href={item.href}
                  className="btn btn-ghost block w-full rounded-btn px-3 py-2 text-left text-sm data-[focus]:bg-base-300"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className={`btn btn-ghost block w-full rounded-btn px-3 py-2 text-left text-sm data-[focus]:bg-base-300 ${item.variant === 'danger' ? 'text-error' : ''}`}
                >
                  {item.label}
                </button>
              )}
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  )
}
