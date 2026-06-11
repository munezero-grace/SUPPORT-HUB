import { Card } from '@/components/ui/Card'
import { StatCardProps } from '@/types/dashboard.types'

export function StatCard({
  name,
  value,
  change,
  changeType = 'neutral',
  info,
  icon,
  className,
}: StatCardProps) {
  return (
    <Card className={`border border-gray-100 ${className || ''}`}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-bold text-gray-600">{name}</p>
        {icon && <div className="p-1">{icon}</div>}
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900">
          {typeof value === 'string' && value.length > 15
            ? `${value.substring(0, 15)}...`
            : value}
        </p>
        {change && (
          <div
            className={`text-sm ${
              changeType === 'increase'
                ? 'text-gray-600'
                : changeType === 'decrease'
                ? 'text-gray-600'
                : 'text-gray-500'
            }`}
          >
            <span className="font-medium">{change}</span>
            {info && <span className="text-gray-500 ml-1">{info}</span>}
          </div>
        )}
      </div>
    </Card>
  )
}
