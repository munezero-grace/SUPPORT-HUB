import axiosInstance from '../services/axios-instance.service'
import { AxiosError } from 'axios'
import { TicketUpdateData } from '@/types/TicketTypes'
import { ERROR_MESSAGES } from '@/constants/errorMessages'
import { RESPONSE_STATUS } from '@/constants/errorMessages'
import { mapTickets } from '@/utils/mapTickets'
import type { Ticket } from '@/types/interfaces/interface'

const BASE_URL = '/tickets'

export const ticketService = {
  createTicket: async (ticketData: FormData) => {
    try {
      const response = await axiosInstance.post(BASE_URL, ticketData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return {
            status: RESPONSE_STATUS.ERROR,
            message: ERROR_MESSAGES.UNAUTHORIZED,
          }
        }
        if (error.response?.status === 403) {
          return {
            status: RESPONSE_STATUS.ERROR,
            message: ERROR_MESSAGES.FORBIDDEN,
          }
        }
        if (error.response?.data?.error) {
          return {
            status: RESPONSE_STATUS.ERROR,
            message: error.response.data.error,
          }
        }
      }
      return {
        status: RESPONSE_STATUS.ERROR,
        message: ERROR_MESSAGES.TICKET_CREATE_FAILED,
      }
    }
  },

  getUserTickets: async () => {
    try {
      const response = await axiosInstance.get(BASE_URL)
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data
      }
      return []
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          status: RESPONSE_STATUS.ERROR,
          message:
            error.response?.data?.error || ERROR_MESSAGES.TICKETS_FETCH_FAILED,
        }
      }
      return {
        status: RESPONSE_STATUS.ERROR,
        message: ERROR_MESSAGES.TICKETS_FETCH_FAILED,
      }
    }
  },

  getTicketById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}`)
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          status: RESPONSE_STATUS.ERROR,
          message:
            error.response?.data?.error || ERROR_MESSAGES.TICKET_NOT_FOUND,
        }
      }
      return {
        status: RESPONSE_STATUS.ERROR,
        message: ERROR_MESSAGES.TICKET_NOT_FOUND,
      }
    }
  },

  getTicketByCode: async (ticketCode: string) => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/code/${ticketCode}`)
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          status: RESPONSE_STATUS.ERROR,
          message:
            error.response?.data?.error || ERROR_MESSAGES.TICKET_NOT_FOUND,
        }
      }
      return {
        status: RESPONSE_STATUS.ERROR,
        message: ERROR_MESSAGES.TICKET_NOT_FOUND,
      }
    }
  },

  updateTicket: async (id: string, ticketData: FormData | TicketUpdateData) => {
    try {
      const headers =
        ticketData instanceof FormData
          ? { 'Content-Type': 'multipart/form-data' }
          : { 'Content-Type': 'application/json' }

      const response = await axiosInstance.put(
        `${BASE_URL}/${id}`,
        ticketData,
        {
          headers,
        }
      )
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          status: RESPONSE_STATUS.ERROR,
          message:
            error.response?.data?.error || ERROR_MESSAGES.TICKET_UPDATE_FAILED,
        }
      }
      return {
        status: RESPONSE_STATUS.ERROR,
        message: ERROR_MESSAGES.TICKET_UPDATE_FAILED,
      }
    }
  },

  deleteTicket: async (id: string) => {
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`)
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          status: RESPONSE_STATUS.ERROR,
          message:
            error.response?.data?.error || ERROR_MESSAGES.TICKET_DELETE_FAILED,
        }
      }
      return {
        status: RESPONSE_STATUS.ERROR,
        message: ERROR_MESSAGES.TICKET_DELETE_FAILED,
      }
    }
  },

  assignTicket: async (ticketId: string, assigneeId: string, deadline?: string) => {
    const response = await axiosInstance.post(`${BASE_URL}/${ticketId}/assign`, { assigneeId, deadline })
    return response.data
  },

  getAssignedTickets: async () => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/assigned`)
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data
      }
      return []
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          status: RESPONSE_STATUS.ERROR,
          message: error.response?.data?.error || ERROR_MESSAGES.TICKETS_FETCH_FAILED,
        }
      }
      return { status: RESPONSE_STATUS.ERROR, message: ERROR_MESSAGES.TICKETS_FETCH_FAILED }
    }
  },

  getTicketsForUser: async (userId: string) => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/assigned/${userId}`)
      if (response.data && Array.isArray(response.data.data)) return response.data.data
      return []
    } catch {
      return []
    }
  },

  addComment: async (ticketId: string, text: string) => {
    const response = await axiosInstance.post(`${BASE_URL}/${ticketId}/comments`, { text })
    return response.data
  },

  addNote: async (ticketId: string, text: string) => {
    const response = await axiosInstance.post(`${BASE_URL}/${ticketId}/notes`, { text })
    return response.data
  },

  getRankedTickets: async (): Promise<Ticket[]> => {
    const response = await axiosInstance.get<{ data: Record<string, unknown>[] }>(
      `${BASE_URL}/ranked`
    )
    const raw = Array.isArray(response.data?.data) ? response.data.data : []
    return mapTickets(raw)
  },
}
