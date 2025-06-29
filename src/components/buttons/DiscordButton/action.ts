'use server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function handleDiscordLogin() {
  const origin = (await headers()).get('origin')
  const supabase = await createClient()
  console.log('Origin:', origin)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord', // or "github", "facebook", etc.
    options: {
      redirectTo: `${origin}/auth/callback`, // Your OAuth callback URL
    },
  })

  if (data.url) {
    redirect(data.url) // Redirect to the OAuth provider's login page
  }

  console.log('Discord Login Response:', { data, error })
}
