import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

import DashboardLayout from '@/layouts/DashboardLayout'
import { User } from '@/types/user.type'
import '../globals.css'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    // If no user is found, redirect to the login page
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', currentUser.id)
    .single()
    .overrideTypes<User>()

  if (!userData) {
    const searchParams = new URLSearchParams({
      status: '404',
      message: 'User not found',
    })

    // If no user data is found, redirect to the error page
    redirect(`/error?${searchParams.toString()}`)
  }


  const user: User = userData

  return (
    <html lang="en">
      <body>
        <DashboardLayout user={user}>{children}</DashboardLayout>
      </body>
    </html>
  )
}
