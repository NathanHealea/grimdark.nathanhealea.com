
export type Error = string[]


/**
 *  Represents the errors for a form.
 */
export type Errors = Record<string, Error>

export type FormValidation = {
  errors: Errors
  success: boolean
}

/**
 * Represents the response from a form State.
 */
export type FormState<T> = {
  state: T
  errors: Errors
  success: boolean
}

/**
 * Represents a form action that processes form data and returns a FormState.
 */
type FormAction<T> = (state: FormState<T>, formData: FormData) => FormState<T> | Promise<FormState<T>>
