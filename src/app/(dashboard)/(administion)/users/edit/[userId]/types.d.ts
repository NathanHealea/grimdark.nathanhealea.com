import { type FormState } from '@/types';

export type EditUser = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
};

export type EditUserFormState = FormState<EditUser>;
