import type { Metadata } from 'next'

import PublicLayout from '@/layouts/PublicLayout'

import '../globals.css'

export const metadata: Metadata = {
  title: 'Grimdark League',
  authors: [{ name: 'Grimdark League Team', url: 'https://grimdark.nathanhealea.com' }],
  description: 'Leaguge of Warhammer 40,000 players',
}

export default PublicLayout
