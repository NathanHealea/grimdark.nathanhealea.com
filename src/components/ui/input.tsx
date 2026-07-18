import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

/**
 * Native <input> primitive. Styled via the `input` class family in `input.css`.
 * Defaults to the bordered look; compose `input-error`/`input-lg` via `className`.
 */
export function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return <input type={type} className={cn('input input-bordered', className)} {...props} />
}
