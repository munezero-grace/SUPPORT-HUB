'use client'

import { DashboardTab } from '@/types/dashboard.types'

interface DashboardTabsProps {
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
}

const tabs: DashboardTab[] = ['Overview', 'Tickets', 'Clients', 'Products']

export default function DashboardTabs({
  activeTab,
  onTabChange,
}: DashboardTabsProps) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`
              py-2 px-1 border-b-2 text-sm transition-colors duration-100
              ${
                activeTab === tab
                  ? 'border-transparent text-black font-bold'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300 font-medium'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  )
}
