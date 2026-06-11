'use client'

import { useEffect, useState } from 'react'
import { dashboardAPI } from '@/services/dashboard.service'
import { DashboardData, TicketItem } from '@/types/dashboard.types'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  awaiting_client: 'bg-orange-100 text-orange-700',
  resolved: 'bg-green-100 text-green-700',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  in_progress: 'In Progress',
  awaiting_client: 'Awaiting Client',
  resolved: 'Resolved',
}

const PIE_COLORS = ['#60a5fa', '#fbbf24', '#fb923c', '#4ade80']

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
}

function getWeekLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(date)
  monday.setDate(diff)
  return monday.toISOString().split('T')[0]
}

function formatWeekLabel(isoDate: string): string {
  const d = new Date(isoDate)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ReportsPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dashboardAPI.getAllDashboardData()
        setData(result)
      } catch {
        setError('Failed to load report data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error || 'No data available.'}</p>
      </div>
    )
  }

  const { overview, tickets, clients, products } = data

  const totalTickets = overview?.stats?.totalTickets ?? 0
  const openTickets = overview?.stats?.openTickets ?? 0
  const resolvedCount = tickets?.resolved?.length ?? 0

  const statusCounts = [
    { key: 'new',             count: tickets?.new?.length ?? 0 },
    { key: 'in_progress',     count: tickets?.in_progress?.length ?? 0 },
    { key: 'awaiting_client', count: tickets?.awaiting_client?.length ?? 0 },
    { key: 'resolved',        count: resolvedCount },
  ]

  // Chart 1: status pie data
  const statusPieData = statusCounts.map(({ key, count }) => ({
    name: STATUS_LABELS[key],
    value: count,
  }))

  // Chart 2: priority bar data
  const allTickets: TicketItem[] = [
    ...(tickets?.new ?? []),
    ...(tickets?.in_progress ?? []),
    ...(tickets?.awaiting_client ?? []),
    ...(tickets?.resolved ?? []),
  ]

  const priorityCountMap: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 }
  allTickets.forEach((t) => {
    const p = t.priority?.toLowerCase()
    if (p && p in priorityCountMap) priorityCountMap[p]++
  })
  const priorityBarData = [
    { name: 'Critical', count: priorityCountMap.critical, fill: PRIORITY_COLORS.critical },
    { name: 'High',     count: priorityCountMap.high,     fill: PRIORITY_COLORS.high },
    { name: 'Medium',   count: priorityCountMap.medium,   fill: PRIORITY_COLORS.medium },
    { name: 'Low',      count: priorityCountMap.low,      fill: PRIORITY_COLORS.low },
  ]

  // Chart 3: tickets per week (last 8 weeks)
  const weekMap: Record<string, number> = {}
  allTickets.forEach((t) => {
    if (!t.createdAt) return
    const week = getWeekLabel(t.createdAt)
    weekMap[week] = (weekMap[week] || 0) + 1
  })
  const weeklyData = Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([week, count]) => ({ week: formatWeekLabel(week), count }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of support operations</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tickets"   value={totalTickets}              color="border-blue-500" />
        <StatCard label="Open Tickets"    value={openTickets}               color="border-yellow-500" />
        <StatCard label="Resolved"        value={resolvedCount}             color="border-green-500" />
        <StatCard label="Total Clients"   value={clients?.totalClients ?? 0} color="border-purple-500" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Chart 1: Tickets by Status (Pie) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Tickets by Status</h2>
          {totalTickets === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No tickets yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} tickets`]} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Chart 2: Tickets by Priority Tier (Bar) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Tickets by Priority</h2>
          {allTickets.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No tickets yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={priorityBarData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`${v} tickets`]} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorityBarData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 3: Tickets created per week (Line) */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Tickets Created per Week</h2>
        {weeklyData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No ticket history yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v} tickets`]} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#111827"
                strokeWidth={2}
                dot={{ r: 4, fill: '#111827' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Clients & Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Client Summary</h2>
          <div className="space-y-3">
            <SummaryRow label="Total Clients"   value={clients?.totalClients ?? 0} />
            <SummaryRow label="Active Clients"  value={clients?.activeClients ?? 0} />
            <SummaryRow label="Premium Clients" value={clients?.premiumClients ?? 0} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Product Summary</h2>
          <div className="space-y-3">
            <SummaryRow label="Total Products"  value={products?.totalProducts ?? 0} />
            <SummaryRow label="Active Products" value={products?.activeProducts ?? 0} />
            <SummaryRow
              label="Most Active Product"
              value={products?.mostActiveProduct?.name ?? '—'}
              sub={products?.mostActiveProduct ? `${products.mostActiveProduct.ticketCount} tickets` : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${color}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  )
}

function SummaryRow({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="text-right">
        <span className="text-sm font-semibold text-gray-800">{value}</span>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}
