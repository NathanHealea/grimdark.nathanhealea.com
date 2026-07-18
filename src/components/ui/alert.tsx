import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

/**
 * Inline alert banner. Styled via the `alert` class family in `alert.css`.
 * Compose a status modifier via `className` (e.g. `alert-error`).
 */
export function Alert({ className, role = 'alert', ...props }: ComponentProps<'div'>) {
  return <div role={role} className={cn('alert', className)} {...props} />
}
