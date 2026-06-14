'use client'
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { notificationService } from '@/services/notification.service'

export type NotificationType = 'new_ticket' | 'status_change' | 'ticket_assigned' | 'info' | 'warning'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  description: string
  timestamp: string
  read: boolean
  ticketCode?: string
}

interface NotificationContextValue {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

const STORAGE_KEY_PREFIX = 'supporthub_notifications'
const STORAGE_VERSION_KEY = 'supporthub_notifications_version'
const STORAGE_VERSION = 'v2'

// Each user gets their own localStorage key so clients never see staff notifications.
function storageKey(userId: string | undefined): string {
  return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX
}

function loadFromStorage(userId: string | undefined): AppNotification[] {
  try {
    const key = storageKey(userId)
    if (localStorage.getItem(STORAGE_VERSION_KEY) !== STORAGE_VERSION) {
      localStorage.removeItem(key)
      localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION)
      return []
    }
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(userId: string | undefined, notifications: AppNotification[]) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(notifications.slice(0, 50)))
  } catch {}
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const userId = session?.user?.id as string | undefined
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  // Tracks which userId has been loaded so saves don't overwrite storage before load completes.
  const loadedForRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (status === 'loading') return
    loadedForRef.current = undefined
    const stored = loadFromStorage(userId)
    setNotifications(stored)
    loadedForRef.current = userId
  }, [userId, status])

  useEffect(() => {
    if (loadedForRef.current !== userId) return
    saveToStorage(userId, notifications)
  }, [notifications, userId])

  // Poll server every 30 s for cross-user notifications (e.g. admin sees client's new ticket).
  // Merges only notifications whose DB id isn't already in local state.
  const syncFromServer = useCallback(async () => {
    const serverNotifs = await notificationService.getAll()
    if (serverNotifs.length === 0) return
    setNotifications((prev) => {
      const existingServerIds = new Set(
        prev.filter((n) => n.id.startsWith('server-')).map((n) => n.id)
      )
      const incoming = serverNotifs
        .filter((sn) => !existingServerIds.has(`server-${sn.id}`))
        .map((sn) => ({
          id: `server-${sn.id}`,
          type: sn.type as NotificationType,
          title: sn.title,
          description: sn.body,
          timestamp: sn.createdAt,
          read: sn.read,
          ticketCode: sn.ticketCode ?? undefined,
        }))
      if (incoming.length === 0) return prev
      return [...incoming, ...prev].slice(0, 50)
    })
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    syncFromServer()
    const interval = setInterval(syncFromServer, 30_000)
    return () => clearInterval(interval)
  }, [status, syncFromServer])

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const notification: AppNotification = {
      ...n,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date().toISOString(),
      read: false,
    }
    setNotifications((prev) => [notification, ...prev.slice(0, 49)])
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    // Also mark server-side notifications read (fire-and-forget)
    notificationService.markAllRead().catch(() => {})
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
