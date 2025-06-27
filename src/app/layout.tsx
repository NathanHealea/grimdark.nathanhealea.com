import type { Metadata } from 'next'

import { createClient } from '@/lib/supabase/server'
import './globals.css'
import Navigation from './navigation'

export const metadata: Metadata = {
  title: 'Grimdark League',
  authors: [{ name: 'Grimdark League Team', url: 'https://grimdark.nathanhealea.com' }],
  description: 'Leaguge of Warhammer 40,000 players',
}

export type RootLayout = {
  children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayout) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  )
}
