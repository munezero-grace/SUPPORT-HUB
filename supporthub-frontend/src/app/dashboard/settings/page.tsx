'use client'
import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import GeneralSettings from '@/components/settings/GeneralSettings'
import IntegrationsSettings from '@/components/settings/IntegrationsSettings'
import UsersSettings from '@/components/settings/UsersSettings'

const TAB_MAP: Record<string, string> = {
  general: 'General',
  integrations: 'Integrations',
  users: 'Users',
}

const SettingsPage = () => {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'super_admin'
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState(() => {
    const param = searchParams.get('tab')?.toLowerCase() ?? ''
    return TAB_MAP[param] ?? 'General'
  })

  const tabs = isAdmin
    ? [
        { id: 'General', label: 'General' },
        { id: 'Integrations', label: 'Integrations' },
        { id: 'Users', label: 'Users' },
      ]
    : [{ id: 'General', label: 'General' }]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'General':
        return <GeneralSettings />
      case 'Integrations':
        return <IntegrationsSettings />
      case 'Users':
        return <UsersSettings />
      default:
        return <GeneralSettings />
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and configure system preferences
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div>{renderTabContent()}</div>
      </div>
    </div>
  )
}

export default SettingsPage
