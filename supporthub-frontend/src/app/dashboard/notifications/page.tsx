'use client'

import { useRouter } from 'next/navigation'
import { useNotifications, AppNotification, NotificationType } from '@/context/NotificationContext'

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const TYPE_CONFIG: Record<NotificationType, { icon: string; dotColor: string; label: string }> = {
  new_ticket:     { icon: '🎫', dotColor: 'bg-blue-500',   label: 'New Ticket' },
  status_change:  { icon: '🔄', dotColor: 'bg-yellow-500', label: 'Status Change' },
  ticket_assigned:{ icon: '👤', dotColor: 'bg-purple-500', label: 'Assignment' },
  info:           { icon: 'ℹ️', dotColor: 'bg-gray-400',   label: 'Info' },
  warning:        { icon: '⚠️', dotColor: 'bg-red-500',    label: 'Warning' },
}

function NotificationRow({ notification, onRead }: { notification: AppNotification; onRead: (id: string) => void }) {
  const router = useRouter()
  const config = TYPE_CONFIG[notification.type]

  const handleClick = () => {
    onRead(notification.id)
    if (notification.ticketCode) {
      router.push(`/dashboard/tickets/${notification.ticketCode}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-4 px-6 py-4 border-b border-gray-100 transition-colors ${
        notification.ticketCode ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
      } ${!notification.read ? 'bg-blue-50/40' : 'bg-white'}`}
    >
      {/* Unread dot */}
      <div className="flex-shrink-0 mt-1.5">
        {!notification.read
          ? <span className={`block w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
          : <span className="block w-2.5 h-2.5 rounded-full bg-transparent" />
        }
      </div>

      {/* Icon */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base">
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
              {notification.title}
            </p>
            <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{notification.description}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(notification.timestamp)}</p>
            <p className="text-[11px] text-gray-300 mt-0.5 whitespace-nowrap">{formatTimestamp(notification.timestamp)}</p>
          </div>
        </div>
        {notification.ticketCode && (
          <p className="text-xs text-blue-500 mt-1 font-mono">{notification.ticketCode}</p>
        )}
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up'}
          </p>
        </div>
        {notifications.length > 0 && (
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={clearAll}
              className="px-4 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🔔</div>
            <p className="text-base font-semibold text-gray-600">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">You&apos;ll see ticket updates and assignments here</p>
          </div>
        ) : (
          <div>
            {notifications.map((n) => (
              <NotificationRow key={n.id} notification={n} onRead={markAsRead} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
