import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

/** Card surface. Styled via the `card` class family in `card.css`. */
export function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('card', className)} {...props} />
}

/** Padded content region inside a `Card`. */
export function CardBody({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('card-body', className)} {...props} />
}

/** Card heading. */
export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return <h3 className={cn('card-title', className)} {...props} />
}
