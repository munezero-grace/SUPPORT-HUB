import { IUserProfile, UserCompanyProfile } from '@/types/interfaces/Settings'
import axiosInstance from '@/services/axios-instance.service'
import type { SlackSettings, ApiResponse } from '../types/settings'
import { User } from '@/types'

export const getUserProfile = async (): Promise<IUserProfile> => {
  const response = await axiosInstance.get('/users/profile')
  return response.data
}

export const updateUserProfile = async (data: Partial<User>) => {
  const response = await axiosInstance.put('/users/profile', data)
  return response.data
}

export const updateUserCompanyProfile = async (
  data: Partial<UserCompanyProfile>
) => {
  const response = await axiosInstance.put('/users/profile/company', data)
  return response.data
}

export const getSlackSettings = async (): Promise<
  ApiResponse<SlackSettings>
> => {
  const response = await axiosInstance.get('/settings/slack-integration')
  return response.data
}

export const updateSlackSettings = async (
  data: SlackSettings
): Promise<ApiResponse<SlackSettings>> => {
  const response = await axiosInstance.put('/settings/slack-integration', data)
  return response.data
}

const settingsService = {
  getUserProfile,
  updateUserProfile,
  updateUserCompanyProfile,
  getSlackSettings,
  updateSlackSettings,
}

export default settingsService
