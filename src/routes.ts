export type NavLink = {
  href: string
  label: string
}

export const publicLinks: NavLink[] = [
  { href: '/members', label: 'Members' },
  { href: '/battle-reports', label: 'Battle Reports' },
]

export const memberLinks: NavLink[] = [
  { href: '/battle-reports/submit', label: 'Submit Battle Report' },
]

export const adminLinks: NavLink[] = [
  { href: '/admin/user-management', label: 'Uers' },
]
