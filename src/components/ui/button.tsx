import { Slot } from '@radix-ui/react-slot'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type ButtonProps = ComponentProps<'button'> & {
  /** Render the child element instead of a `<button>` (e.g. a Next `<Link>`). */
  asChild?: boolean
}

/**
 * Semantic button primitive. Renders the DaisyUI-style `btn` class family
 * (styled in `src/styles/components/button.css`) on top of shadcn tokens.
 * Compose color/style/size modifiers via `className` (e.g. `btn-primary btn-sm`).
 */
export function Button({ className, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn('btn', className)} type={asChild ? undefined : (type ?? 'button')} {...props} />
}
