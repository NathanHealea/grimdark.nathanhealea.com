// components/LogoutButton.js
'use client' // If using App Router in Next.js

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function LogoutButton(props: LogoutButtonProps) {
  const { className = 'btn btn-ghost', ...rest } = props
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.signOut()
      if (!error) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Could not sign out:', error)
    }
  }

  return (
    <button className={className} onClick={handleLogout} {...rest}>
      Log Out
    </button>
  )
}
