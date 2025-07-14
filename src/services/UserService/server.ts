import { createClient } from '@/lib/supabase/server';
import UserService from './service';



export default async function createUserService() {
  const supabase = await createClient()
  return new UserService(supabase)
}
