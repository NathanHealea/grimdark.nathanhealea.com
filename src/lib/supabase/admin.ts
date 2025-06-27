import { createClient as createAdminClient } from '@supabase/supabase-js';
import { Database } from './database.types';

export function createClient() {

  return createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
