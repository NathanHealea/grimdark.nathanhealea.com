import { createClient } from '@/lib/supabase/client'
import { Role } from '@/types/role.types'
import { User } from '@/types/user.type'
import { useEffect, useState } from 'react'

/**
 * Custom hook to fetch the current user from Supabase.
 * It retrieves the authenticated user and their data from the 'users', and 'roles' table.
 * @returns An object containing the current user and a loading state.
 * The user is null if not authenticated or if the user data could not be fetched.
 */
export default function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = await createClient()
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (currentUser) {
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', currentUser.id)
          .single()
          .overrideTypes<User>()

        const { data: userRoles } = await supabase
          .from('user_auth_roles')
          .select('*')
          .eq('user_id', currentUser.id)
          .overrideTypes<Role[], { merge: false }>()

        setUser({
          ...profileData,
          roles: userRoles || ([] as Role[]),
        } as User)
      }
      setLoading(false)
    }

    fetchUser()
  }, [])

  return { user, loading }
}
