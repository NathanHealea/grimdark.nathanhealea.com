import { UserIcon } from '@heroicons/react/24/solid'

import { Avatar as AvatarRoot, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

type AvatarProps = {
  src: string | null
  displayName: string
  size?: 'sm' | 'lg'
}

const sizeClasses = {
  sm: 'w-10',
  lg: 'w-24',
} as const

const iconClasses = {
  sm: 'w-5 h-5',
  lg: 'w-12 h-12',
} as const

export default function Avatar({ src, displayName, size = 'sm' }: AvatarProps) {
  return (
    <AvatarRoot className={cn(sizeClasses[size], 'mx-auto', !src && 'avatar-placeholder justify-center')}>
      {src ? (
        <AvatarImage src={src} alt={displayName} />
      ) : (
        <AvatarFallback>
          <UserIcon className={iconClasses[size]} />
        </AvatarFallback>
      )}
    </AvatarRoot>
  )
}
