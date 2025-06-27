import { type FormState } from '@/types';

export type Login = {
  email: string;
  password: string;
};

export type LoginFormState = FormState<Login>;
