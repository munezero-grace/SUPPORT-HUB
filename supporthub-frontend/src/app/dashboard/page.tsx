'use client'

import { useSession } from 'next-auth/react'
import { Button } from '../../components/ui/Button'
import { PlusIcon } from '@/components/icons'
import { useState } from 'react'
import { DashboardTab, DashboardData } from '@/types/dashboard.types'
import { dashboardAPI } from '@/services/dashboard.service'
import DashboardTabs from '@/components/shared/DashboardTabs'
import CreateTicketModal from '@/components/tickets/CreateTicketModal'
import { useQuery } from '@tanstack/react-query'
import renderDashboardTabContent from '@/components/dashboard/renderDashboardTabContent'
import { queryClient } from '@/providers/QueryProvider'
import Link from 'next/link'

const ADMIN_ROLES  = ['super_admin', 'ticket_manager']
const CLIENT_ROLES = ['client']
const TEAM_ROLES   = ['developer']

/* ─────────────────────────────────────────────
   Quick-action card used on role-specific views
───────────────────────────────────────────── */
function QuickCard({
  href,
  icon,
  title,
  description,
  cta,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  cta: string
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
    >
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-900 group-hover:text-white transition-colors duration-200">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        <span className="mt-3 inline-block text-xs font-medium text-gray-600 group-hover:text-gray-900">
          {cta} →
        </span>
      </div>
    </Link>
  )
}

/* ─────────────────────────────────────────────
   Team-member dashboard
───────────────────────────────────────────── */
function TeamMemberDashboard({ name }: { name: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, <strong>{name}</strong>! Here&apos;s your workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickCard
          href="/dashboard/my-tasks"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          title="My Tasks"
          description="View and update tasks assigned to you"
          cta="Open task list"
        />
        <QuickCard
          href="/dashboard/settings"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          title="Profile & Settings"
          description="Update your profile and notification preferences"
          cta="Go to settings"
        />
      </div>

      {/* Getting-started tip */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-start gap-3">
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-gray-600">
          Tasks are assigned to you by an admin. Head to{' '}
          <Link href="/dashboard/my-tasks" className="font-semibold underline">My Tasks</Link>{' '}
          to see your current workload and update task progress.
        </p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Client dashboard
───────────────────────────────────────────── */
function ClientDashboard({
  name,
  onNewTicket,
}: {
  name: string
  onNewTicket: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, <strong>{name}</strong>! Track your requests below.
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={onNewTicket}
        >
          <PlusIcon className="w-4 h-4" />
          New Request
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickCard
          href="/dashboard/tickets"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          }
          title="My Requests"
          description="View all your submitted support requests and their current status"
          cta="View all requests"
        />
        <QuickCard
          href="/dashboard/settings"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          title="My Profile"
          description="Manage your account details and contact information"
          cta="Go to profile"
        />
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-blue-700">
          Submit a new request using the <strong>New Request</strong> button above.
          You can track the progress and see which team member is assigned under{' '}
          <Link href="/dashboard/tickets" className="font-semibold underline">My Requests</Link>.
        </p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Admin dashboard (original)
───────────────────────────────────────────── */
function AdminDashboard({
  userName,
  onNewTicket,
}: {
  userName: string
  onNewTicket: () => void
}) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('Overview')

  const { data, isLoading, error } = useQuery({
    queryKey: ['get-statistics'],
    queryFn: dashboardAPI.getAllDashboardData,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, <strong>{userName}</strong>! Here&apos;s an overview of
            your support operations.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/reports">
            <Button variant="outline" className="w-full sm:w-auto">
              View Reports
            </Button>
          </Link>
          <Button
            className="w-full sm:w-auto flex items-center justify-center gap-2"
            onClick={onNewTicket}
          >
            <PlusIcon className="w-4 h-4" />
            New Ticket
          </Button>
        </div>
      </div>

      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {renderDashboardTabContent(
        data as DashboardData,
        activeTab,
        isLoading,
        error ? (error instanceof Error ? error.message : String(error)) : null
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Root page — delegates by role
───────────────────────────────────────────── */
export default function DashboardPage() {
  const { data: session } = useSession()
  const role     = session?.user?.role || ''
  const userName = session?.user?.name || ''

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleTicketCreated = async () => {
    queryClient.invalidateQueries({ queryKey: ['get-statistics'] })
  }

  return (
    <>
      {ADMIN_ROLES.includes(role) && (
        <AdminDashboard
          userName={userName}
          onNewTicket={() => setIsCreateModalOpen(true)}
        />
      )}

      {TEAM_ROLES.includes(role) && (
        <TeamMemberDashboard name={userName.split(' ')[0] || userName} />
      )}

      {CLIENT_ROLES.includes(role) && (
        <ClientDashboard
          name={userName.split(' ')[0] || userName}
          onNewTicket={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* Fallback for unknown roles */}
      {!ADMIN_ROLES.includes(role) && !TEAM_ROLES.includes(role) && !CLIENT_ROLES.includes(role) && (
        <AdminDashboard
          userName={userName}
          onNewTicket={() => setIsCreateModalOpen(true)}
        />
      )}

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />
    </>
  )
}
