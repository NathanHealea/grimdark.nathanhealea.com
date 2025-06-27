'use server';
import { createClient } from '@/lib/supabase/server';
import { Errors } from '@/types';
import { CreateUser, CreateUserFormState } from './types';
import { validateCreate } from './validation';
import { redirect } from 'next/navigation';

export default async function createFormAction(
  initialState: CreateUserFormState,
  formData: FormData
): Promise<CreateUserFormState> {
  const state: CreateUserFormState = {
    state: initialState.state,
    errors: {} as Errors,
    success: false,
  };

  try {
    const createUser: CreateUser = {
      username: formData.get('username')?.toString() || '',
      email: formData.get('email')?.toString() || '',
    };

    state.state = {
      username: createUser.username || state.state?.username || '',
      email: createUser.email || state.state?.email || '',
    };

    // Validate the createuser data
    const validationResponse = await validateCreate(createUser);

    state.errors = validationResponse.errors;

    if (validationResponse.success) {
      const supabase = await createClient();

      // Attempt to create user the user in the database
      // const { data, error } = await supabase.auth.signUp({
      //   email: createuser.email,
      //   password: createuser.password,
      //   options: {
      //     data: {
      //       username: createuser.username,
      //     },
      //   },
      // })

      const { data, error } = await supabase.from('users').insert({
        username: createUser.username,
        email: createUser.email,
      });

      if (error) {
        state.errors.form = [error.message];
      } else {
        state.success = true;
      }
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

  if(state.success) {
    redirect('/users?message=User created successfully&status=success');
  }

  return state;

  // Validate and process formData here
  // If successful, update state.success to true
  // If there are errors, populate state.errors
}
