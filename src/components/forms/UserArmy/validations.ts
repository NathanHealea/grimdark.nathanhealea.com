import { Errors, FormValidation } from '@/types/form.types';
import { UserArmy } from './types';
import { createClient } from '@/lib/supabase/server';

/** 
 * Validates a user ID.
 * @param userId - The user ID to validate.
 * @returns An array of error messages if validation fails, otherwise an empty array.
 */
export function validateUserId(userId: number | null): string[] {
  let errors: string[] = [];
  if (!userId) {
    errors = ['User ID is required.'];
  }
  else if (typeof userId !== 'number' || userId <= 0) {
    errors = ['User ID must be a positive number.'];
  }
  else if (!Number.isInteger(userId)) {
    errors = ['User ID must be an integer.'];
  }

  return errors;
}
/** 
 * Validates an army ID.
 * @param userId - The army ID to validate.
 * @returns An array of error messages if validation fails, otherwise an empty array.
 */
export function validateArmyId(userId: number | null): string[] {
  let errors: string[] = [];
  if (!userId) {
    errors = ['Army ID is required.'];
  }
  else if (typeof userId !== 'number' || userId <= 0) {
    errors = ['Army ID must be a positive number.'];
  }
  else if (!Number.isInteger(userId)) {
    errors = ['Army ID must be an integer.'];
  }

  return errors;

}

/**
 * Validates a UserArmy object.
 * @param userArmy - The UserArmy object to validate.
 * @returns A promise that resolves to a FormValidation object containing errors and success status.
 */
export async function validateAddUserArmy(userArmy: UserArmy): Promise<FormValidation> {

  const errors: Record<string, string[]> = {};
  let success = true;


  const supabase = await createClient();

  // validate the User ID
  errors.user_id = validateUserId(userArmy.user_id);
  if (errors.user_id.length > 0) {
    success = false;
  }


  // Validate the Army ID
  errors.army_id = validateArmyId(userArmy.army_id);
  if (errors.army_id.length > 0) {
    success = false;
  }

  // Check if army_id is a valid army ID (assuming it should be a number)
  const { data, error } = await supabase.from('armies').select('id').eq('id', userArmy.army_id).maybeSingle();
  if (error || !data) {
    errors.army_id = ['Army ID is not valid.'];
    success = false;
  }


  return {
    errors,
    success,
  };

}


/**
 * Validates a UserArmy object.
 * @param userArmy - The UserArmy object to validate.
 * @returns A promise that resolves to a FormValidation object containing errors and success status.
 */
export async function validateRemoveUserArmy(userArmy: UserArmy): Promise<FormValidation> {

  const errors: Record<string, string[]> = {};
  let success = true;


  const supabase = await createClient();

  // validate the User ID
  errors.user_id = validateUserId(userArmy.user_id);
  if (errors.user_id.length > 0) {
    success = false;
  }


  // Validate the Army ID
    errors.army_id = validateArmyId(userArmy.army_id);
  if (errors.army_id.length > 0) {
    success = false;
  }

  // Check if army_id is a valid army ID (assuming it should be a number)
  const { data, error } = await supabase.from('armies').select('id').eq('id', userArmy.army_id).maybeSingle();
  if (error || !data) {
    errors.army_id = ['Army ID is not valid.'];
    success = false;
  }

  // Check if the user army exists in the database
  const { data: userArmyData, error: userArmyError } = await supabase
    .from('user_armies')
    .select('id')
    .eq('user_id', userArmy.user_id)
    .eq('army_id', userArmy.army_id)
    .maybeSingle();

  if (userArmyError || !userArmyData) {
    errors.form = ['User army does not exist.'];
    success = false;
  }


  return {
    errors,
    success,
  };

}