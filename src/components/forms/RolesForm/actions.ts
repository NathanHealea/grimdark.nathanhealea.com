'use server';
import { createClient } from '@/lib/supabase/server';
import { RolesFormState } from './types';




export default async function roleFormAction(initialState: RolesFormState, formData: FormData): Promise<RolesFormState> {
  const state: RolesFormState = {
    state: initialState.state,
    errors: {} as Record<string, string[]>,
    success: false,
  };

  const supabase = await createClient();

  console.log('Role Form Action', initialState, formData);

  try {
    const userId = formData.get('userId')?.toString() || '';
    const role = formData.get('role')?.toString() || '';
    const action = formData.get('action')?.toString() as 'add' | 'remove';

    console.log('Parsed Data', { userId, role, action });

    if (action === 'add') {
      // Add role logic
      const { data, error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add role: ${error.message}`);
      }

    }


    if (action === 'remove') {
      // Remove role logic
    }

    // Simulate success for now
    state.success = true;

  }
  catch (error) {
    if (error instanceof Error) {
      state.errors.form = [error.message];
    } else if (typeof error === 'string') {
      state.errors.form = [error];
    } else {
      state.errors.form = ['An unknown error occurred'];
    }
  }

  // Return the updated state
  console.log('Role Form Action Result', state);
  return state;
}


