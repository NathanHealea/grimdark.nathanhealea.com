import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Check if user already has a linked profile
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (!existingProfile) {
          // Try auto-link via Discord identity
          const discordIdentity = user.identities?.find((i) => i.provider === 'discord')

          if (discordIdentity) {
            const discordUserId = discordIdentity.identity_data?.provider_id ?? discordIdentity.id

            if (discordUserId) {
              // Look for an unlinked profile with matching link_id
              const { data: unlinkedProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('link_id', discordUserId)
                .is('user_id', null)
                .single()

              if (unlinkedProfile) {
                await supabase.rpc('link_profile', {
                  profile_uuid: unlinkedProfile.id,
                  auth_uuid: user.id,
                })
              }
            }
          }
        }
      }

      revalidatePath('/', 'layout')
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=Could not verify your email. Please try again.`)
}
