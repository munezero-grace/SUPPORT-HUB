import axiosInstance from './axios-instance.service'

export const userService = {
  async getAll() {
    const response = await axiosInstance.get('/users')
    return response.data.data
  },
  async create(data: {
    firstName: string
    lastName: string
    email: string
    role: string
    specialty?: string
    clientId?: string
  }) {
    const response = await axiosInstance.post('/users', data)
    return response.data.data
  },
  async softDelete(userId: string) {
    await axiosInstance.delete(`/users/${userId}/soft-delete`)
  },
  async reactivate(userId: string) {
    await axiosInstance.post(`/users/${userId}/restore`)
  },
  async resendInvite(userId: string) {
    const response = await axiosInstance.post(`/users/${userId}/resend-invite`)
    return response.data
  },
  async getTeamMembers() {
    const response = await axiosInstance.get('/users/team')
    return response.data.data
  },
  async update(userId: string, data: { firstName: string; lastName: string; role: string }) {
    const response = await axiosInstance.put(`/users/${userId}`, data)
    return response.data
  },
  async resetPassword(userId: string) {
    const response = await axiosInstance.post(`/users/${userId}/reset-password`)
    return response.data
  },
  async hardDelete(userId: string) {
    const response = await axiosInstance.delete(`/users/${userId}`)
    return response.data
  },
}
