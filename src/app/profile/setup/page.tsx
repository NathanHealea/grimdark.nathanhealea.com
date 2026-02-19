import { getFactions } from '@/modules/faction/queries'
import ProfileForm from './profile-form'

export default async function ProfileSetupPage() {
  const factions = await getFactions()

  return <ProfileForm factions={factions} />
}
