'use client'

import {
  TicketsTabProps,
  TicketCardProps,
  KanbanColumnProps,
} from '@/types/dashboard.types'
import { Card } from '@/components/ui/Card'

function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 rounded-xl">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {ticket.ticketCode}
            </span>
            <span className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-800">
              {ticket.product?.name || 'No Product'}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-900 font-medium truncate max-w-xs">
          {ticket.title}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {ticket.client?.companyName || 'No Client'}
          </span>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </div>
    </Card>
  )
}

function KanbanColumn({ title, count, tickets }: KanbanColumnProps) {
  const safeTickets = Array.isArray(tickets) ? tickets : []
  return (
    <Card className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col min-h-[420px] shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold text-white bg-black`}
        >
          {count}
        </span>
      </div>
      <div className="flex-1 flex flex-col gap-4">
        {safeTickets.slice(0, 3).map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
      <button className="w-full py-3 text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors mt-4 border-t border-gray-100">
        View all
      </button>
    </Card>
  )
}

export default function TicketsTab({ data, loading }: TicketsTabProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse h-[420px] rounded-xl border border-gray-100 shadow-sm"
          />
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load ticket data</p>
      </div>
    )
  }

  const columns = [
    {
      title: 'New',
      tickets: data.new,
      count: data.new.length,
      color: 'bg-black',
    },
    {
      title: 'In Progress',
      tickets: data.in_progress,
      count: data.in_progress.length,
      color: 'bg-black',
    },
    {
      title: 'Awaiting Client',
      tickets: data.awaiting_client,
      count: data.awaiting_client.length,
      color: 'bg-black',
    },
    {
      title: 'Recently Resolved',
      tickets: data.resolved,
      count: data.resolved.length,
      color: 'bg-black',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {columns.map((column) => (
          <KanbanColumn
            key={column.title}
            title={column.title}
            count={column.count}
            tickets={column.tickets}
            color={column.color}
          />
        ))}
      </div>
    </div>
  )
}
