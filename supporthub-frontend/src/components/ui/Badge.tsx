import { cn } from '@/lib/utils'
import { BadgeProps } from '@/types/interfaces/Props'
import { variantClasses } from '@/constants/otherConst'
import { BADGE_VARIANTS } from '@/types/badges'

export function Badge({ 
  children, 
  variant = BADGE_VARIANTS.DEFAULT,
  className 
}: BadgeProps) {
 

  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  )
}
