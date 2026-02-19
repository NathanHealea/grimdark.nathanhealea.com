import { getFactions } from '@/modules/faction/queries'
import ProfileForm from './profile-form'

export default async function ProfileSetupPage() {
  const factions = await getFactions()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <ProfileForm factions={factions} />
    </div>
  )
}
