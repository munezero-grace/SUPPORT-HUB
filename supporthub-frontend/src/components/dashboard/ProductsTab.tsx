'use client'

import { ProductsTabProps } from '@/types/dashboard.types'
import { CubeIcon } from '@heroicons/react/24/outline'
import { StatCard } from '@/components/shared/StatCard'

export default function ProductsTab({ data, loading }: ProductsTabProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl  text-black">Product Overview</h2>
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
        <p className="text-gray-500">Failed to load product data</p>
      </div>
    )
  }

  const productStats = [
    {
      name: 'Total Products',
      value: data.totalProducts,
      change: 'No change',
      changeType: 'neutral' as const,
      info: 'from last month',
      icon: <CubeIcon className="w-5 h-5 text-gray-400" />,
    },
    {
      name: 'Active Products',
      value: data.activeProducts,
      change: 'No change',
      changeType: 'neutral' as const,
      info: 'from last month',
      icon: <CubeIcon className="w-5 h-5 text-gray-400" />,
    },
    {
      name: 'Most Active',
      value:
        data.mostActiveProduct && data.mostActiveProduct.name
          ? data.mostActiveProduct.name
          : 'N/A',
      change:
        data.mostActiveProduct && typeof data.mostActiveProduct.ticketCount === 'number'
          ? `${data.mostActiveProduct.ticketCount} active tickets`
          : '',
      changeType: 'neutral' as const,
      info: '',
      icon: <CubeIcon className="w-5 h-5 text-gray-400" />,
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-700">Product Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {productStats.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>
    </div>
  )
}
