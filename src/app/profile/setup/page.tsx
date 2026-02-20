import { getAuthUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { getFactions } from '@/modules/faction/queries'
import ProfileForm from './profile-form'

export default async function ProfileSetupPage() {
  const [factions, auth] = await Promise.all([getFactions(), getAuthUser()])

  let suggestedName = ''
  let nameAlreadyTaken = false

  if (auth?.user) {
    const meta = auth.user.user_metadata
    suggestedName = meta?.full_name ?? meta?.name ?? meta?.custom_username ?? ''

    if (suggestedName) {
      const supabase = await createClient()
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .ilike('display_name', suggestedName.trim())
        .single()

      nameAlreadyTaken = !!existing
    }
  }

  return (
    <main className="flex flex-col items-center justify-center -mt-16 pt-16 min-h-screen">
    <div className="flex-1 flex justify-center items-center">
      <ProfileForm factions={factions} suggestedName={suggestedName} nameAlreadyTaken={nameAlreadyTaken} />
    </div>
    </main>
  )
}
