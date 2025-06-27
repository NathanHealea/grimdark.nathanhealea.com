import { type FormState } from '@/types';

export type CreateUser = {
  username: string;
  email: string;
};

export type CreateUserFormState = FormState<CreateUser>;
