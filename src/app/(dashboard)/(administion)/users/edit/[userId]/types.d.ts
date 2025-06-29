import { type FormState } from '@/types/form.types';

export type EditUser = {
  id: number;
  username: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
};

export type EditUserFormState = FormState<EditUser>;
