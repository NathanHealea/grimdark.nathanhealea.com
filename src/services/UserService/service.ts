import { Role } from '@/types/role.types'
import { User } from '@/types/user.type'
import { SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js'

export default class UserService {
  private client: SupabaseClient

  constructor(client: SupabaseClient) {
    this.client = client
  }

  /**
   * Fetches the current authenticated user from Supabase.
   * @returns {Promise<SupabaseAuthUser | null>} A promise that resolves to the current user or null if not authenticated.
   * If an error occurs, it logs the error and returns null.
   */
  async getCurrentUser(): Promise<SupabaseAuthUser | null> {
    try {
      const {
        data: { user: currentUser },
      } = await this.client.auth.getUser()

      if (!currentUser) {
        throw new Error('No authenticated user found')
      }
      return currentUser
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching current user:', error.message)
      } else if (typeof error === 'string') {
        console.error('Error fetching current user:', error)
      } else {
        console.error('An unexpected error occurred while fetching the current user:', error)
      }
      return null
    }
  }

  /**
   * Fetches user data by user ID from the 'users' table and their roles from the 'user_auth_roles' table.
   * If the user is not found or an error occurs, it logs the error and returns null.
   *
   * @param userId - The user ID to fetch data for.
   * @returns {Promise<User | null>} A promise that resolves to the user data or null if not found.
   *
   * @throws {Error} If the user ID is not provided or is not a string.
   * @throws {Error} If the user is not found in the 'users' table.
   * @throws {Error} If there is an error fetching user data or roles.
   *
   * @returns {Promise<User | null>} A promise that resolves to the user data or null if not found.
   */
  async getUserByUserId(userId: string):Promise<User | null> {
    console.log('Fetching user data for userId:', userId)
    try {
      if (!userId) {
        throw new Error('User ID is required to fetch user data')
      } else if (typeof userId !== 'string') {
        throw new Error('User ID must be a string')
      }

      // Fetch user data from the 'users' table
      const { data: userProfile, error: userProfileError } = await this.client
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single()
        .overrideTypes<User>()

      if (userProfileError) {
        throw userProfileError
      } else if (!userProfile) {
        throw new Error('User not found')
      }

      // Fetch user roles from the 'user_auth_roles' table
      const { data: userRoles, error: userRolesErrors } = await this.client
        .from('user_auth_roles')
        .select('*')
        .eq('user_id', userId)
        .overrideTypes<Role[], { merge: false }>()

      return {
        ...userProfile,
        roles: userRoles || ([] as Role[]), // Ensure roles is always an array
      } as User
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching user data:', error.message)
      } else if (typeof error === 'string') {
        console.error('Error fetching user data:', error)
      } else {
        console.error('An unexpected error occurred while fetching the user data', error)
      }

      return null
    }
  }
}
