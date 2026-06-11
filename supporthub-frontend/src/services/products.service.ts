import axiosInstance from '@/services/axios-instance.service'
import { Product, ProductFormData } from '@/types/interfaces/product'
import { AxiosError } from 'axios'
import { ERROR_MESSAGES } from '@/constants/errorMessages'
import { RESPONSE_STATUS } from '@/constants/errorMessages'

const BASE_URL = '/products'

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await axiosInstance.get<Product[]>(BASE_URL)
      return response.data
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw error
    }
  },

  getProductsByClient: async (clientCode?: string): Promise<Product[]> => {
    try {
      if (!clientCode) {
        type ApiResponse = { data: { data: Product[] } } | { data: Product[] }
        const response = await axiosInstance.get<ApiResponse>(
          `${BASE_URL}/client-products`
        )
        if ('data' in response.data) {
          return (response.data as { data: Product[] }).data
        }
        return response.data as Product[]
      }

      type ClientApiResponse = { data: Product[] } | Product[]
      const response = await axiosInstance.get<ClientApiResponse>(
        `${BASE_URL}/client/${clientCode}`
      )

      if (Array.isArray(response.data)) {
        return response.data
      }
      if ('data' in response.data) {
        return response.data.data
      }
      return []
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          return []
        }
      }
      return []
    }
  },

  fetchProductsWithActiveClients: async (): Promise<Product[]> => {
    try {
      const response = await axiosInstance.get<Product[]>(BASE_URL)
      const productsWithActiveClients = response.data.map(
        (product: Product) => ({
          ...product,
          activeClients: product.clientProducts
            ? product.clientProducts.length
            : 0,
        })
      )
      return productsWithActiveClients
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw error
    }
  },

  getProduct: async (id: string): Promise<Product> => {
    try {
      const response = await axiosInstance.get<Product>(`${BASE_URL}/id/${id}`)
      return response.data
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw error
    }
  },

  createProduct: async (
    productData: ProductFormData
  ): Promise<Product | { status: string; message: string }> => {
    try {
      const normalizedData = {
        ...productData,
        status: productData.status.toLowerCase() as 'active' | 'inactive',
        description: productData.description.trim(),
      }
      const response = await axiosInstance.post<Product>(
        BASE_URL,
        normalizedData
      )
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
        if (error.response?.data?.message) {
          return {
            status: RESPONSE_STATUS.ERROR,
            message: error.response.data.message,
          }
        }
      }
      return {
        status: RESPONSE_STATUS.ERROR,
        message: ERROR_MESSAGES.PRODUCT_CREATE_FAILED,
      }
    }
  },

  updateProduct: async (
    id: string,
    productData: Partial<ProductFormData>
  ): Promise<Product> => {
    try {
      const normalizedData = {
        ...productData,
        status: productData.status
          ? (productData.status.toLowerCase() as 'active' | 'inactive')
          : undefined,
        description: productData.description
          ? productData.description.trim()
          : undefined,
      }
      const response = await axiosInstance.put<Product>(
        `${BASE_URL}/${id}`,
        normalizedData
      )
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          throw new Error('You must be logged in to perform this action')
        }
        if (error.response?.status === 403) {
          throw new Error('You do not have permission to perform this action')
        }
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message)
        }
      }
      throw new Error('Failed to update product')
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`)
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw error
    }
  },

  getClientsForProduct: async (productId: string) => {
    const { data } = await axiosInstance.get(`${BASE_URL}/${productId}/clients`)
    return data
  },

  addClientToProduct: async (productId: string, clientId: string) => {
    const { data } = await axiosInstance.post(
      `${BASE_URL}/${productId}/clients/${clientId}`
    )
    return data
  },

  removeClientFromProduct: async (productId: string, clientId: string) => {
    await axiosInstance.delete(`${BASE_URL}/${productId}/clients/${clientId}`)
  },
}

export const productsService = {
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await axiosInstance.get<Product[]>(BASE_URL)
      return response.data
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw error
    }
  },

  addClientToProduct: async (productId: string, clientId: string) => {
    try {
      const { data } = await axiosInstance.post(
        `${BASE_URL}/${productId}/clients/${clientId}`
      )
      return data
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw error
    }
  },
}
