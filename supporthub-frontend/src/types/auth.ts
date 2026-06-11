import type { AxiosRequestConfig } from 'axios'
export interface Client {
  companyName: string
  contactName: string
  contactEmail: string
  supportTier?: string
  status?: string
  userId?: string
}

export interface CustomUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  contactName?: string
  name?: string
  role: string
  token?: string
  provider?: string
  providerId?: string
  client?: Client
  hasChangedPassword?: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface GoogleProfile {
  sub: string
  name: string
  email: string
  picture?: string
  role?: string
}

export interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean
}

export interface ErrorResponse {
  message?: string
}

export interface QueueItem {
  resolve: (value: string) => void
  reject: (reason?: string) => void
}
