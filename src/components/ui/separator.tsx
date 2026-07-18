'use client'

import * as SeparatorPrimitive from '@radix-ui/react-separator'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

/**
 * Separator built on Radix Separator. Styled via the `separator` class in
 * `separator.css`. For a labelled rule, use the `divider` class on a plain
 * element instead (text-in-divider variant).
 */
export function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      decorative={decorative}
      className={cn('separator', className)}
      {...props}
    />
  )
}
