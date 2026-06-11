import { LoadingSpinnerProps } from '../../types/interfaces/Props'
import { colorClasses } from '../../constants/colorClasses '
import { sizeClasses } from '../../constants/otherConst'

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
}: LoadingSpinnerProps) {
  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizeClasses[size]} ${colorClasses[color]}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}
