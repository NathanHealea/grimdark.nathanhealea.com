import Navigation from './components/navigation'

export type PublicLayoutProps = {
  children: React.ReactNode
}

export default async function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  )
}
