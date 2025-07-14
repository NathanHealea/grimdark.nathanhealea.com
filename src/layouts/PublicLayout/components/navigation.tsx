import { createClient } from '@/lib/supabase/server'
import { User } from '@/types/user.type'
import Link from 'next/link'
import MainNavigation from './main'
import MobileNavigation from './mobile'
export default async function Navigation() {
  const supabase = await createClient()

  let user: User | null = null

  const {
    data: { user: currentUser },
    error,
  } = await supabase.auth.getUser()

  if (currentUser) {

    const { data: userProfile, error: userProfileError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', currentUser.id)
      .single()
      .overrideTypes<User>()

    user = userProfile;
  }

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <Link href="/" className="btn btn-ghost text-xl">
        Grimdark League
      </Link>

      <div className="flex-1" />

      <div className="flex-none">
        <MainNavigation user={user} />
        <MobileNavigation user={user} />
      </div>
    </div>
  )
}
