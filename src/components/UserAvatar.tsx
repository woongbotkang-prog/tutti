interface UserAvatarProps {
  emoji?: string | null
  avatarUrl?: string | null
  displayName?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE_MAP = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-lg',
  lg: 'w-12 h-12 text-xl',
  xl: 'w-20 h-20 text-3xl',
}

export default function UserAvatar({
  emoji,
  avatarUrl,
  displayName,
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const sizeClass = SIZE_MAP[size]

  // Priority: emoji > avatar_url > initial
  if (emoji) {
    return (
      <div className={`${sizeClass} rounded-full bg-cream flex items-center justify-center ${className}`}>
        {emoji}
      </div>
    )
  }

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName || '프로필'}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    )
  }

  // Fallback: first character of display name
  const initial = displayName?.[0] || '?'
  return (
    <div className={`${sizeClass} rounded-full bg-cream flex items-center justify-center text-accent font-bold ${className}`}>
      {initial}
    </div>
  )
}
