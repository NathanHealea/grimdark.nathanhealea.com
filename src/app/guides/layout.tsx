import { getAuthUser } from '@/lib/supabase/auth';
import { hasAnyRole } from '@/lib/supabase/roles';
import { redirect } from 'next/navigation';

export default async function GuidesLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthUser()

  if (!auth) {
    redirect('/unauthorized')
  }

  const canAccess = await hasAnyRole(auth.user.id, ['user', 'organizer', 'admin'])

  if (!canAccess) {
    redirect('/')
  }

  return children
}
