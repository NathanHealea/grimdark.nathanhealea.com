import { type FormState } from '@/types/form.types';

export type Login = {
  email: string;
  password: string;
};

export type LoginFormState = FormState<Login>;
