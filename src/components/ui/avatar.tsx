'use client'

import * as AvatarPrimitive from '@radix-ui/react-avatar'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * Avatar container built on Radix Avatar. Styled via the `avatar` class family
 * in `avatar.css`. Size it with a width utility (e.g. `className="w-10"`) and
 * add `avatar-placeholder` when rendering a fallback. The inner wrapper clips
 * the image/fallback into a circle.
 */
export function Avatar({
  className,
  children,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Root> & { children?: ReactNode }) {
  return (
    <AvatarPrimitive.Root className={cn('avatar', className)} {...props}>
      <div className="rounded-full">{children}</div>
    </AvatarPrimitive.Root>
  )
}

/** Avatar image built on Radix Avatar.Image. */
export function AvatarImage({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image className={cn(className)} {...props} />
}

/** Avatar fallback (shown while the image loads or is missing). */
export function AvatarFallback({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return <AvatarPrimitive.Fallback className={cn(className)} {...props} />
}
