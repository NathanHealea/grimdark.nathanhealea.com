import { FormState } from '@/types/form.types';



export type UserArmy = {
  id?: number;
  user_id: number;
  army_id: number;
  is_primary: boolean;

};


export type UserArmyFormState = FormState<UserArmy>;