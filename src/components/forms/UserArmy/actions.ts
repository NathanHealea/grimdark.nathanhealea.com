import { Errors } from '@/types/form.types';
import { UserArmy, UserArmyFormState } from './types';



export default async function addUserArmyAction(initialState: UserArmyFormState, formData: FormData): Promise<UserArmyFormState> {

  const state: UserArmyFormState = {
    state: initialState.state,
    errors: {} as Errors,
    success: false,
  };

  return state;
}