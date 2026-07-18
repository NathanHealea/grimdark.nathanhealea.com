import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

/**
 * Native <textarea> primitive. Styled via the `textarea` class family in
 * `textarea.css`. Defaults to the bordered look.
 */
export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn('textarea textarea-bordered', className)} {...props} />
}
