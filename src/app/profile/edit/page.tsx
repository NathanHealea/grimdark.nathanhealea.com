import { getAuthUser } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import EditProfileForm from './edit-profile-form'

export default async function EditProfilePage() {
  const auth = await getAuthUser({ withProfile: true })

  if (!auth) {
    redirect('/sign-in')
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <EditProfileForm profile={auth.profile} />
    </div>
  )
}
