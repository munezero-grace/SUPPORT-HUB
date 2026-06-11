'use client'
import React, { useRef, useEffect } from 'react'
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

const TYPE_CONFIG: Record<NotificationType, { icon: string; bg: string; color: string }> = {
  new_ticket: { icon: '🎫', bg: 'bg-blue-50', color: 'text-blue-600' },
  status_change: { icon: '🔄', bg: 'bg-yellow-50', color: 'text-yellow-600' },
  ticket_assigned: { icon: '👤', bg: 'bg-purple-50', color: 'text-purple-600' },
  info: { icon: 'ℹ️', bg: 'bg-gray-50', color: 'text-gray-600' },
  warning: { icon: '⚠️', bg: 'bg-red-50', color: 'text-red-600' },
}

function NotificationItem({ notification, onRead }: { notification: AppNotification; onRead: (id: string) => void }) {
  const config = TYPE_CONFIG[notification.type]
  const router = useRouter()

  const handleClick = () => {
    onRead(notification.id)
    if (notification.ticketCode) {
      router.push(`/dashboard/tickets/${notification.ticketCode}`)
    }
  }

  return (
    <div
      className={`flex gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50/40' : ''}`}
      onClick={handleClick}
    >
      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base ${config.bg}`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium truncate ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.description}</p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo(notification.timestamp)}</p>
      </div>
    </div>
  )
}

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
}

const MAX_VISIBLE = 10

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications()
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
      style={{ animation: 'slideDown 0.15s ease-out' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Notification list */}
      <div className="overflow-y-auto divide-y divide-gray-50" style={{ maxHeight: '400px' }}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <div className="text-3xl mb-2">🔔</div>
            <p className="text-sm font-medium text-gray-600">All caught up!</p>
            <p className="text-xs text-gray-400 mt-1">No notifications yet</p>
          </div>
        ) : (
          notifications.slice(0, MAX_VISIBLE).map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {notifications.length === 0
            ? 'No notifications'
            : notifications.length > MAX_VISIBLE
              ? `Showing 10 of ${notifications.length}`
              : `${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`}
        </p>
        <button
          onClick={() => { onClose(); router.push('/dashboard/notifications') }}
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          View all →
        </button>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
