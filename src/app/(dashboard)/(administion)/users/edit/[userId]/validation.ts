import { Errors } from '@/types';
import { EditUser } from './types';
import { createClient } from '@/lib/supabase/server';

export async function validateEditUser(user: EditUser, userId: string): Promise<{ errors: Errors; success: boolean; }> {
  const errors: Errors = {};
  let success = true;

  const supabase = await createClient();

  console.log('Validating user:', user, userId);

  const isUsernameTaken = async (username: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('id', userId) // Exclude current user if editing
      .maybeSingle();

    if (error) {
      throw new Error(`Error checking username: ${error.message}`);
    }

    if (data) {
      return true; // Username is taken
    }

    return false; // Username is available
  };

  try {
    // Validate username
    if (!user.username || user.username.trim() === '') {
      errors.username = ['Username is required.'];
      success = false;
    }
    else if(await isUsernameTaken(user.username)) {
      errors.username = ['Username is already taken.'];
      success = false;
    }

    // Check if user name is already taken (this is a placeholder, actual implementation would require a database check)

    // Validate email
    if (!user.email) {
      errors.email = ['Email is required.'];
      success = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      errors.email = ['Invalid email format.'];
      success = false;
    }

  } catch (error) {
    if (error instanceof Error) {
      errors.form = [error.message];
    } else if (typeof error === 'string') {
      errors.form = [error];
    } else {
      errors.form = ['An unknown error occurred.'];
    }
  }

  return { errors, success };
}
