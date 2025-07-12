'use server';
import { createClient } from '@/lib/supabase/server';
import { Errors } from '@/types/form.types';
import { EditUser, EditUserFormState } from './types';
import { validateEditUser } from './validation';

export default async function editUserFormAction(
  initialState: EditUserFormState,
  formData: FormData
): Promise<EditUserFormState> {

  const state: EditUserFormState = {
    state: initialState.state,
    errors: {} as Errors,
    success: false,
  };

  try {
    const user: EditUser = {
      id: initialState.state.id,
      username: formData.get('username')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      first_name: formData.get('first_name')?.toString() || '',
      last_name: formData.get('last_name')?.toString() || '',
      bio: formData.get('bio')?.toString() || '',
      status: formData.get('status')?.toString() || '',
      password: formData.get('password')?.toString() || '',
      passwordConfirmation: formData.get('passwordConfirmation')?.toString() || '',
    };


    state.state = {
      ...state.state,
      ...user,
    };

    // Validate the edit user data
    const validationResponse = await validateEditUser(user);

    state.errors = validationResponse.errors;

    if (validationResponse.success) {
      const supabase = await createClient();

      // Attempt to update the user in the database
      const { data: updatedUser, error } = await supabase.from('users')
        .update({
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          bio: user.bio,
          status: user.status,
        })
        .eq('id', initialState.state.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // If password is provided, update it
      if (user.password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: user.password,
        });

        if (passwordError) {
          throw passwordError;
        }
      }

      state.state = {
        ...state.state,
        ...updatedUser,
      };

      // If the update is successful, set success to true
      state.success = true;
    }
  } catch (error) {
    if (error instanceof Error) {
      state.errors.form = [error.message];
    } else if (typeof error === 'string') {
      state.errors.form = [error];
    } else {
      state.errors.form = ['An unknown error occurred.'];
    }
  }

  return state;
}
