import { Client, CreateClientDto, UpdateClientDto } from '../types/clients'
import axiosInstance from '@/services/axios-instance.service'

const BASE_URL = '/clients'

export const clientService = {
  getAll: async () => {
    const { data } = await axiosInstance.get<{
      status: string
      data: Client[]
    }>(BASE_URL)
    return data.data
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<{ status: string; data: Client }>(
      `${BASE_URL}/${id}`
    )
    return data.data
  },

  create: async (clientData: CreateClientDto) => {
    const { data } = await axiosInstance.post<{ status: string; data: Client }>(
      BASE_URL,
      clientData
    )
    return data.data
  },

  update: async (id: string, updateData: UpdateClientDto) => {
    const { data } = await axiosInstance.patch<{
      status: string
      data: Client
    }>(`${BASE_URL}/${id}`, updateData)
    return data.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(`${BASE_URL}/${id}`)
  },

  softDelete: async (clientId: string) => {
    await axiosInstance.patch(`${BASE_URL}/${clientId}/soft-delete`)
  },

  getProductsForClient: async (id: string) => {
    const { data } = await axiosInstance.get(
      `/clients/${id}/products`
    )
    return data
  },

  addProductToClient: async (id: string, productId: string) => {
    const { data } = await axiosInstance.post(
      `/clients/${id}/products/${productId}`
    )
    return data
  },

  removeProductFromClient: async (id: string, productId: string) => {
    await axiosInstance.delete(
      `/clients/${id}/products/${productId}`
    )
  },
}
