'use client'

import { ClientsTabProps } from '@/types/dashboard.types'
import { StatCard } from '@/components/shared/StatCard'
import { UsersIcon } from '@heroicons/react/24/solid'

export default function ClientsTab({ data, loading }: ClientsTabProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-700">Client Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(3)].map((_, i) => (
            <StatCard key={i} name="" value="" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load client data</p>
      </div>
    )
  }

  const clientStats = [
    {
      name: 'Total Clients',
      value: data.totalClients,
      change: '+1',
      changeType: 'increase' as const,
      info: 'from last month',
      icon: <UsersIcon className="w-5 h-5 text-gray-400" />,
    },
    {
      name: 'Active Clients',
      value: data.activeClients,
      change: 'No change',
      changeType: 'neutral' as const,
      info: 'from last month',
      icon: <UsersIcon className="w-5 h-5 text-gray-400" />,
    },
    {
      name: 'Inactive Clients',
      value: data.totalClients - data.activeClients,
      change: 'No change',
      changeType: 'neutral' as const,
      info: 'not currently active',
      icon: <UsersIcon className="w-5 h-5 text-gray-400" />,
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-700">Client Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {clientStats.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>
    </div>
  )
}
