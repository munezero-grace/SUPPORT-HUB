import axios, { AxiosError } from 'axios'
import {
  ExtendedAxiosRequestConfig,
  ErrorResponse,
  QueueItem,
} from '@/types/auth'
import { getSession, signOut } from 'next-auth/react'

const baseURLRaw = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
const baseURL = baseURLRaw.endsWith('/api') ? baseURLRaw : baseURLRaw + '/api'

const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
  },
})

let isRefreshing = false
let failedQueue: QueueItem[] = []

const processQueue = (
  error: AxiosError | Error | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error?.message || String(error))
    } else {
      prom.resolve(token as string)
    }
  })

  failedQueue = []
}

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession()
      if (session?.user?.accessToken) {
        config.headers.Authorization = `Bearer ${session.user.accessToken}`
      }
      return config
    } catch (error) {
      return Promise.reject(error)
    }
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const token = await new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
          if (!originalRequest.headers) {
            originalRequest.headers = {}
          }
          originalRequest.headers['Authorization'] = `Bearer ${token}`
          return axiosInstance(originalRequest)
        } catch (err) {
          return Promise.reject(err)
        }
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await signOut({ callbackUrl: '/' })
        processQueue(new Error('Authentication failed'))
      } catch (refreshError) {
        processQueue(refreshError as Error)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    const errorData = error.response?.data as ErrorResponse
    const errorMessage =
      errorData?.message || error.message || 'An error occurred'
    error.message = errorMessage
    return Promise.reject(error)
  }
)

export default axiosInstance
