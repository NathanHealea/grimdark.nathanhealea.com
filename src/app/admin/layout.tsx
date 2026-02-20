import { getAuthUser } from '@/lib/supabase/auth'
import { hasRole } from '@/lib/supabase/roles'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthUser()

  if (!auth) {
    redirect('/sign-in')
  }

  const isAdmin = await hasRole(auth.user.id, 'admin')

  if (!isAdmin) {
    redirect('/')
  }

  return children
}
