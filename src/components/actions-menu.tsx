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

      <MenuItems anchor="bottom end" modal={false} transition className="menu-dropdown w-48">
        <div className="menu-dropdown-body">
          {items.map((item, i) => (
            <MenuItem key={isLinkItem(item) ? item.href : `action-${i}`}>
              {isLinkItem(item) ? (
                <Link href={item.href} className="menu-item">
                  {item.label}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className={`menu-item${item.variant === 'danger' ? ' menu-item-danger' : ''}`}
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
