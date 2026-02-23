export type NavLink = {
  href: string
  label: string
  className?: string
}

export const publicLinks: NavLink[] = [
  { href: '/members', label: 'Members' },
  { href: '/battle-reports', label: 'Battle Reports' },
  { href: '/seasons', label: 'Seasons' },
]

export const memberLinks: NavLink[] = [
  { href: '/battle-reports/drafts', label: 'My Drafts' },
  { href: '/battle-reports/submit', label: 'Submit Battle Report', className: 'btn btn-outline btn-primary btn-sm' },
]

export const adminLinks: NavLink[] = [
  { href: '/admin/user-management', label: 'Users' },
  { href: '/admin/seasons', label: 'Seasons' },
]
