import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

/**
 * Status badge/pill. Styled via the `badge` class family in `badge.css`.
 * Compose color/style/size modifiers via `className` (e.g. `badge-success badge-sm`).
 */
export function Badge({ className, ...props }: ComponentProps<'span'>) {
  return <span className={cn('badge', className)} {...props} />
}
