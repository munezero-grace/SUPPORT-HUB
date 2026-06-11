'use client'

import { OverviewTabProps } from '@/types/dashboard.types'
import { StatCard } from '@/components/shared/StatCard'
import { TicketIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

export default function OverviewTab({ data, loading }: OverviewTabProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <StatCard key={i} name="" value="" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load overview data</p>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Tickets',
      value: data.stats.totalTickets,
      icon: <TicketIcon className="w-5 h-5 text-gray-400" />,
    },
    {
      name: 'Open Tickets',
      value: data.stats.openTickets,
      icon: <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>
    </div>
  )
}
