import React from 'react'
import PersonnelProfileSection from './PersonnelProfileSection'
import CompanyProfileSection from './CompanyProfileSection'
import { getUserProfile } from '@/services/settings.service'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'

const GeneralSettings: React.FC = () => {
  const { data: session } = useSession()
  const { data: user } = useQuery({
    queryKey: ['get-user-profile'],
    queryFn: getUserProfile,
  })
  const isAdmin = session?.user?.role === 'super_admin'

  if (!user) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <PersonnelProfileSection data={user} />
      {!isAdmin && <CompanyProfileSection data={user?.data?.Clients[0]} />}
    </div>
  )
}

export default GeneralSettings
