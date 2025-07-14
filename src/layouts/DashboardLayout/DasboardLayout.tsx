'use client'
import useTailwindBreakpoints from '@/hooks/useTailwindBreakPoints'
import { useState } from 'react'
import Navigation from './components/navigation'
import Sidebar from './components/sidebar'
import { User } from '@/types/user.type';

export type DashboardLayoutProps = {
  user: User
  children: React.ReactNode
}

export default function DashboardLayout(props: DashboardLayoutProps) {
  const { user, children } = props
  const isMd = useTailwindBreakpoints('md')

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleOnClose = () => setIsSidebarOpen(false)
  const handleOnOpen = () => setIsSidebarOpen(true)

  return (
    <>
      {/* Main Content */}
      <div className="md:pl-64">
        <Navigation user={user} handleOnOpen={handleOnOpen} />
        {children}
      </div>

      {/* Sidebar */}
      <Sidebar open={isSidebarOpen} onClose={handleOnClose} />
    </>
  )
}
