export type FormState<TErrors = Record<string, string>> = {
  errors?: Partial<TErrors>
  error?: string
  success?: string
} | null
