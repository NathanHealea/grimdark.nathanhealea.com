import { UserIcon } from '@heroicons/react/24/solid'

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
  if (src) {
    return (
      <div className={`avatar ${sizeClasses[size]} mx-auto`}>
        <div className="rounded-full">
          <img src={src} alt={displayName} />
        </div>
      </div>
    )
  }

  return (
    <div className={`avatar avatar-placeholder ${sizeClasses[size]} justify-center mx-auto`}>
      <div className="bg-neutral text-neutral-content rounded-full flex items-center justify-center">
        <UserIcon className={iconClasses[size]} />
      </div>
    </div>
  )
}
