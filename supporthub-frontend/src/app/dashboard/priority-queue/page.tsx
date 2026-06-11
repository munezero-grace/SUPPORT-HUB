'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ticketService } from '@/services/tickets.service'
import { Table } from '@/components/ui/Table'
import { PriorityScoreBadge } from '@/components/tickets/PriorityScoreBadge'
import type { Ticket } from '@/types/interfaces/interface'

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-purple-100 text-purple-700',
  awaiting_client: 'bg-orange-100 text-orange-700',
  resolved: 'bg-green-100 text-green-700',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  in_progress: 'In Progress',
  assigned: 'Assigned',
  awaiting_client: 'Awaiting Client',
  resolved: 'Resolved',
}

type RankedTicket = Ticket & { _rank: number }

function buildColumns() {
  return [
    {
      header: '#',
      accessor: (ticket: RankedTicket) => (
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold
            ${ticket._rank === 1 ? 'bg-red-100 text-red-700' :
              ticket._rank === 2 ? 'bg-orange-100 text-orange-700' :
              ticket._rank === 3 ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-600'}`}
        >
          {ticket._rank}
        </span>
      ),
      className: 'w-14',
    },
    {
      header: 'Ticket',
      accessor: (ticket: RankedTicket) => (
        <div className="min-w-0">
          <Link
            href={`/dashboard/tickets/${ticket.ticketCode || ticket.id}`}
            className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
            title={ticket.title}
            onClick={(e) => e.stopPropagation()}
          >
            {ticket.title}
          </Link>
          {ticket.ticketCode && (
            <span className="text-xs text-gray-400">{ticket.ticketCode}</span>
          )}
        </div>
      ),
      className: 'min-w-[200px]',
    },
    {
      header: 'Client',
      accessor: (ticket: RankedTicket) => {
        const name =
          typeof ticket.client === 'object' && ticket.client
            ? ticket.client.companyName
            : typeof ticket.client === 'string'
            ? ticket.client
            : null
        return (
          <span className="text-sm text-gray-600 truncate block" title={name ?? ''}>
            {name || <span className="text-gray-400">—</span>}
          </span>
        )
      },
      className: 'w-36',
    },
    {
      header: 'Priority Score',
      accessor: (ticket: RankedTicket) => (
        <PriorityScoreBadge score={ticket.priorityScore} confidence={ticket.confidence} llmReasoning={ticket.llmReasoning} variant="detailed" />
      ),
      className: 'w-48',
    },
    {
      header: 'Status',
      accessor: (ticket: RankedTicket) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            STATUS_STYLES[ticket.status] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {STATUS_LABELS[ticket.status] ?? ticket.status}
        </span>
      ),
      className: 'w-36',
    },
    {
      header: 'Created',
      accessor: (ticket: RankedTicket) => (
        <span className="text-sm text-gray-500">
          {ticket.createdAt
            ? new Date(ticket.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : '—'}
        </span>
      ),
      className: 'w-28',
    },
  ]
}

export default function PriorityQueuePage() {
  const [tickets, setTickets] = useState<RankedTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  const fetchRanked = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ticketService.getRankedTickets()
      const ranked: RankedTicket[] = data.map((t, i) => ({ ...t, _rank: i + 1 }))
      setTickets(ranked)
      setLastRefreshed(new Date())
    } catch {
      setError('Failed to load ranked tickets. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRanked()
  }, [fetchRanked])

  const criticalCount = tickets.filter((t) => (t.priorityScore ?? 0) >= 0.75).length
  const highCount = tickets.filter((t) => {
    const s = t.priorityScore ?? 0
    return s >= 0.5 && s < 0.75
  }).length
  const topScore = tickets[0]?.priorityScore ?? 0

  const columns = buildColumns()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Priority Queue</h1>
          <p className="text-gray-500 text-sm mt-1">
            Open tickets ranked by adaptive priority score — emotion · complexity · age
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefreshed && !loading && (
            <span className="text-xs text-gray-400">
              Updated {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchRanked}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-16 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="w-8 h-8 animate-spin text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <p className="text-gray-500 text-sm">Calculating priority scores...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <p className="text-red-500 mb-3">{error}</p>
          <button
            onClick={fetchRanked}
            className="text-sm text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Summary cards — only shown when there are tickets */}
          {tickets.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <SummaryCard
                label="Ranked Tickets"
                value={tickets.length}
                color="border-blue-500"
              />
              <SummaryCard
                label="Critical"
                value={criticalCount}
                color="border-red-500"
              />
              <SummaryCard
                label="High"
                value={highCount}
                color="border-orange-500"
              />
              <SummaryCard
                label="Top Score"
                value={`${Math.round(topScore * 100)}%`}
                color="border-purple-500"
              />
            </div>
          )}

          {/* Score legend */}
          {tickets.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-4 py-3 flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="font-medium text-gray-600 mr-1">Score tiers:</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                Critical ≥ 75%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                High 50–74%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
                Medium 25–49%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                Low &lt; 25%
              </span>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 overflow-hidden">
              <div className="overflow-x-auto">
                <Table
                  data={tickets}
                  columns={columns}
                  className="w-full min-w-[700px]"
                  emptyState={
                    <div className="text-center py-16">
                      <svg
                        className="w-12 h-12 text-gray-300 mx-auto mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <p className="text-gray-500 text-lg mb-1">No open tickets</p>
                      <p className="text-gray-400 text-sm">
                        All tickets are resolved, or no tickets have been created yet.
                      </p>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string
  value: number | string
  color: string
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${color}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  )
}
