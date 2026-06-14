'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { userService } from '@/services/user.service'
import { ticketService } from '@/services/tickets.service'

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  roles: string[]
  specialty?: string | null
  hasChangedPassword?: boolean
  assignedTicketCount: number
}

interface AssignedTicket {
  id: string
  ticketCode?: string
  title: string
  status: string
  priority: string
  product?: { name: string } | null
  client?: { companyName?: string | null } | null
}

const STATUS_COLORS: Record<string, string> = {
  new:             'bg-blue-100 text-blue-700',
  in_progress:     'bg-yellow-100 text-yellow-700',
  assigned:        'bg-purple-100 text-purple-700',
  awaiting_client: 'bg-orange-100 text-orange-700',
  resolved:        'bg-green-100 text-green-700',
}

function formatStatus(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function getRoleLabel(roles: string[]): string {
  if (roles.includes('super_admin'))    return 'Admin'
  if (roles.includes('ticket_manager')) return 'Ticket Manager'
  if (roles.includes('developer'))      return 'Developer'
  return roles[0]?.replace(/_/g, ' ') ?? 'Team Member'
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?'
}

const AVATAR_COLORS = [
  'bg-slate-700', 'bg-indigo-700', 'bg-violet-700',
  'bg-teal-700',  'bg-cyan-700',   'bg-rose-700',
]

function getAvatarColor(id: string): string {
  return AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length]
}

interface TicketsModalProps {
  member: TeamMember
  onClose: () => void
}

function TicketsModal({ member, onClose }: TicketsModalProps) {
  const router = useRouter()
  const [tickets, setTickets] = useState<AssignedTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ticketService.getTicketsForUser(member.id)
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [member.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {member.firstName} {member.lastName}&apos;s Tickets
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} assigned
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm">No tickets assigned to {member.firstName} yet.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {tickets.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => {
                      if (t.ticketCode) router.push(`/dashboard/tickets/${t.ticketCode}`)
                      onClose()
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {t.ticketCode && (
                            <span className="text-[11px] font-mono text-gray-400">{t.ticketCode}</span>
                          )}
                          {t.product?.name && (
                            <span className="text-[11px] text-gray-400">· {t.product.name}</span>
                          )}
                          {t.client?.companyName && (
                            <span className="text-[11px] text-gray-400">· {t.client.companyName}</span>
                          )}
                        </div>
                      </div>
                      <span className={`flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {formatStatus(t.status)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TeamPage() {
  const [team, setTeam]         = useState<TeamMember[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [viewing, setViewing]   = useState<TeamMember | null>(null)

  useEffect(() => {
    userService.getTeamMembers()
      .then((members) => setTeam(members ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredTeam = team.filter((m) => {
    const q = search.toLowerCase()
    return (
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {viewing && (
        <TicketsModal member={viewing} onClose={() => setViewing(null)} />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your team and track task assignments
            </p>
          </div>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Manage Members
          </Link>
        </div>

        {/* Stat card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Members</p>
            <p className="text-3xl font-bold mt-1 text-gray-900">{team.length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
          </svg>
          <input
            type="text"
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Team grid */}
        {filteredTeam.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-14 text-center">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-3"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500 font-medium">
              {search ? 'No members match your search' : 'No team members found'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Add team members from Settings → Users
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeam.map((member) => {
              const assignedCount = member.assignedTicketCount
              const initials      = getInitials(member.firstName, member.lastName)
              const avatarColor   = getAvatarColor(member.id)

              const isPending = member.hasChangedPassword === false

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200"
                >
                  {/* Top row: avatar + name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-full ${avatarColor} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                          {member.firstName} {member.lastName}
                        </h3>
                        {isPending && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                            Invite Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{member.email}</p>
                    </div>
                  </div>

                  {/* Role + specialty badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="inline-block text-xs px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-medium">
                      {getRoleLabel(member.roles)}
                    </span>
                    {member.specialty && (
                      <span className="inline-block text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium">
                        {member.specialty}
                      </span>
                    )}
                  </div>

                  {/* Footer: assigned count + action */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-900">{assignedCount}</span>{' '}
                        task{assignedCount !== 1 ? 's' : ''} assigned
                      </span>
                    </div>
                    <button
                      onClick={() => setViewing(member)}
                      className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      View tickets →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
