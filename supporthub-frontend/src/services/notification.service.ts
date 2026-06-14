import axiosInstance from './axios-instance.service'

export interface ServerNotification {
  id: string
  userId: string
  type: string
  title: string
  body: string
  ticketCode?: string | null
  read: boolean
  createdAt: string
}

export const notificationService = {
  async getAll(): Promise<ServerNotification[]> {
    try {
      const res = await axiosInstance.get('/notifications')
      return res.data?.data ?? []
    } catch {
      return []
    }
  },

  async markAllRead(): Promise<void> {
    try {
      await axiosInstance.patch('/notifications/mark-read')
    } catch {}
  },
}
