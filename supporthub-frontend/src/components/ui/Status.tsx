import { cn } from '@/lib/utils'
import { statusConfig } from '@/constants/statusConfig'
import { StatusProps } from '@/types/interfaces/Props'

export function Status({ type, className }: StatusProps) {
  const config = statusConfig[type]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.text}
    </span>
  )
}
