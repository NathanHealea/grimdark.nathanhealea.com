import { type FormState } from '@/types/form.types'

export type Registration = {
  username: string
  email: string
  password: string
  passwordConfirmation: string
}

export type RegistrationFormState = FormState<Registration>
