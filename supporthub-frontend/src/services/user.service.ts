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
    password: string
    role: string
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
  async getTeamMembers() {
    const response = await axiosInstance.get('/users/team')
    return response.data.data
  },
}
