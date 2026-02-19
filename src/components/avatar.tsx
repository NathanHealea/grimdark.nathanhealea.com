type AvatarProps = {
  src: string | null
  displayName: string
  size?: 'sm' | 'lg'
}

const sizeClasses = {
  sm: 'w-10',
  lg: 'w-24',
} as const

export default function Avatar({ src, displayName, size = 'sm' }: AvatarProps) {
  const initial = displayName.charAt(0).toUpperCase()

  if (src) {
    return (
      <div className={`avatar ${sizeClasses[size]}`}>
        <div className="rounded-full">
          <img src={src} alt={displayName} />
        </div>
      </div>
    )
  }

  return (
    <div className={`avatar avatar-placeholder ${sizeClasses[size]}`}>
      <div className="bg-neutral text-neutral-content rounded-full">
        <span className={size === 'lg' ? 'text-3xl' : 'text-sm'}>{initial}</span>
      </div>
    </div>
  )
}
