import Navbar from '@/components/navbar'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Grimdark League',
  description: 'A Warhammer 40k league management platform. Track battles, showcase your army, and climb the leaderboard.',
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    title: 'Grimdark',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="bg-base-100 text-base-content flex flex-col min-h-screen ">
        <Navbar />
        <div className="relative z-0 flex-1">{children}</div>

        <footer className="border-t border-base-300 bg-base-200 text-base-content/60 text-xs">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4 text-center">
            <p>
              Warhammer 40,000 and all associated marks, logos, and images are trademarks and/or registered trademarks of Games Workshop Ltd. This site is completely unofficial and is in no way endorsed by Games Workshop.
            </p>
            <p>&copy; {new Date().getFullYear()} Grimdark League. All rights reserved.</p>
            <p>
              Created by{' '}
              <a href="https://nathanhealea.com" className="link link-hover text-primary" target="_blank" rel="noopener noreferrer">
                Nathan Healea
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
