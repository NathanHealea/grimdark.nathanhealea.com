import { createClient } from '@/lib/supabase/client'
import UserService from './service'

export default function useUserServiceClient() {
  const supabase = createClient()
  return new UserService(supabase)
}
