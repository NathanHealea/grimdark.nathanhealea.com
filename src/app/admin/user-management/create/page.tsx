import { getFactions } from '@/modules/faction/queries'
import CreateProfileForm from './create-profile-form'

export default async function CreateProfilePage() {
  const factions = await getFactions()

  return (
    <main className="flex flex-col items-center -mt-72 pt-72 min-h-screen w-full">
      <div className="flex-1 flex items-center justify-center w-full px-4 py-24">
        <div className="w-full max-w-md">
          <CreateProfileForm factions={factions} />
        </div>
      </div>
    </main>
  )
}
