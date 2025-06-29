import { FormState } from '@/types/form.types';



export type Role = {
  userId?: string;
  role: string;
  action: 'add' | 'remove';

};


export type RolesFormState = FormState<Role>;