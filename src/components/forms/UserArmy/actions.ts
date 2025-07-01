'use server';
import { Errors } from '@/types/form.types';
import { UserArmy, UserArmyFormState } from './types';

import {validateAddUserArmy, validateRemoveUserArmy} from './validations';
import { createClient } from '@/lib/supabase/server';



/**
 * Adds a user army to the database.
 * @param initialState - The initial state of the form.
 * @param formData - The form data containing user and army IDs.
 * @returns A promise that resolves to the updated UserArmyFormState.
 */
export async function addUserArmyAction(initialState: UserArmyFormState, formData: FormData): Promise<UserArmyFormState> {

  const state: UserArmyFormState = {
    state: initialState.state,
    errors: {} as Errors,
    success: false,
  };

  try {

    const userArmy: UserArmy = {
      user_id: parseInt(formData.get('userId') as string),
      army_id: parseInt(formData.get('armyId') as string),
      is_primary: Boolean(formData.get('is_primary') === 'true'),
    };


    const supabase = await createClient();

    const validateResults = await validateAddUserArmy(userArmy);
    if (validateResults.errors) {
      state.errors = validateResults.errors;
    }

    if (validateResults.success) {


      // Insert the user army into the database
      const { data, error } = await supabase
        .from('user_armies')
        .insert(userArmy)
        .select()
        .single();

      if (error) {
        throw error;
      }

      state.success = true;
    }

  } catch (error) {
    if (error instanceof Error) {
      state.errors.form = [error.message];
    }
    else if (typeof error === 'string') {
      state.errors.form = [error];
    }
    else {
      state.errors.form = ['An unknown error occurred while adding the user army.'];
    }

    console.error('Error adding user army:', error);
  }

  return state;
}


/**
 * Removes a user army from the database.
 * @param initialState - The initial state of the form.
 * @param formData - The form data containing user and army IDs.
 * @returns A promise that resolves to the updated UserArmyFormState.
 */
export async function removeUserArmyAction(initialState: UserArmyFormState, formData: FormData): Promise<UserArmyFormState> {

  const state: UserArmyFormState = {
    state: initialState.state,
    errors: {} as Errors,
    success: false,
  };

  try {

    const userArmy: UserArmy = {
      user_id: parseInt(formData.get('userId') as string),
      army_id: parseInt(formData.get('armyId') as string),
      is_primary: Boolean(formData.get('is_primary') === 'true'),
    };


    const supabase = await createClient();

    const validateResults = await validateRemoveUserArmy(userArmy);
    if (validateResults.errors) {
      state.errors = validateResults.errors;
    }

    if (validateResults.success) {


      // Insert the user army into the database
      const { data, error } = await supabase
        .from('user_armies')
        .delete()
        .eq('user_id', userArmy.user_id)
        .eq('army_id', userArmy.army_id);

      if (error) {
        throw error;
      }

      state.success = true;
    }

  } catch (error) {
    if (error instanceof Error) {
      state.errors.form = [error.message];
    }
    else if (typeof error === 'string') {
      state.errors.form = [error];
    }
    else {
      state.errors.form = ['An unknown error occurred while adding the user army.'];
    }

    console.error('Error adding user army:', error);
  }

  return state;
}