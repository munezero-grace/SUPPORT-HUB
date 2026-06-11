import { DashboardData } from '@/types/dashboard.types'
import axiosInstance from '@/services/axios-instance.service'

class DashboardAPI {
  async getAllDashboardData(): Promise<DashboardData> {
    const response = await axiosInstance.get('/dashboard/all')
    const res = response.data
    return res.data
  }
}

export const dashboardAPI = new DashboardAPI()
