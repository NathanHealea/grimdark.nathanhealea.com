import { Slot } from '@radix-ui/react-slot'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type LinkProps = ComponentProps<'a'> & {
  /** Render the child element instead of an `<a>` (e.g. a Next `<Link>`). */
  asChild?: boolean
}

/**
 * Inline text link. Styled via the `link` class family in `link.css`. Pass
 * `asChild` to apply the styling to a Next `<Link>` or other element.
 */
export function Link({ className, asChild = false, ...props }: LinkProps) {
  const Comp = asChild ? Slot : 'a'
  return <Comp className={cn('link', className)} {...props} />
}
