import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg'

const sizeClass: Record<SpinnerSize, string> = {
  xs: 'spinner-xs',
  sm: 'spinner-sm',
  md: 'spinner-md',
  lg: 'spinner-lg',
}

type SpinnerProps = ComponentProps<'span'> & {
  size?: SpinnerSize
}

/**
 * CSS-animated loading spinner. Styled via the `spinner` class family in
 * `spinner.css`; inherits the surrounding text color via `currentColor`.
 */
export function Spinner({ size = 'md', className, ...props }: SpinnerProps) {
  return (
    <span role="status" aria-label="Loading" className={cn('spinner', sizeClass[size], className)} {...props} />
  )
}
