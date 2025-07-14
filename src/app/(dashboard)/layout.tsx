import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

import DashboardLayout from '@/layouts/DashboardLayout'
import { User } from '@/types/user.type'
import '../globals.css'
import { UserService } from '@/services/UserService';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const userService = new UserService(supabase);

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    // If no user is found, redirect to the login page
    redirect('/login')
  }

  // Fetch user data using the UserService
  const user = await userService.getUserByUserId(currentUser.id)

  if (!user) {
    const searchParams = new URLSearchParams({
      status: '404',
      message: 'User not found',
    })

    // If no user data is found, redirect to the error page
    redirect(`/error?${searchParams.toString()}`)
  }

  return (
    <html lang="en">
      <body>
        <DashboardLayout user={user}>{children}</DashboardLayout>
      </body>
    </html>
  )
}
