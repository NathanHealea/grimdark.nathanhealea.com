export type NavLink = {
  href: string;
  label: string;
  className?: string;
};

export const publicLinks: NavLink[] = [
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/seasons', label: 'Seasons' },
  { href: '/battle-reports', label: 'Battle Reports' },
  { href: '/members', label: 'Members' },
  { href: '/guides', label: 'Guides' },
];

export const memberLinks: NavLink[] = [
  { href: '/battle-reports/submit', label: 'Submit Battle Report', className: 'btn btn-outline btn-primary btn-sm' },
];

export const adminLinks: NavLink[] = [
  { href: '/admin/battle-reports', label: 'Battle Reports' },
  { href: '/admin/seasons', label: 'Seasons' },
];

export const adminOnlyLinks: NavLink[] = [
  { href: '/admin/user-management', label: 'Users' },
];
