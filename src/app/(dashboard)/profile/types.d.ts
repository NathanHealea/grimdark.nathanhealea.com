import { type FormState } from '@/types/form.types';

export type EditProfile = {
  id: number;
  username: string | null;
  email?: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  passwordCurrent?: string; // Optional for current password validation
  password?: string; // Optional for password updates
  passwordConfirmation?: string; // Optional for password confirmation
};

export type EditProfileFormState = FormState<EditProfile>;
