import { getAuthUser } from '@/lib/supabase/auth'
import { hasAnyRole } from '@/lib/supabase/roles'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthUser()

  if (!auth) {
    redirect('/sign-in')
  }

  const canAccessAdmin = await hasAnyRole(auth.user.id, ['admin', 'organizer'])

  if (!canAccessAdmin) {
    redirect('/')
  }

  return children
}
