import axios, { AxiosError } from 'axios'
import {
  CreateOrderCustomFieldDTO,
  OrderCustomField,
  UpdateOrderCustomFieldDTO,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_URL = `${API_BASE_URL}/api/order-fields`

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const orderCustomFieldApi = {
  getAllFields: async (): Promise<OrderCustomField[]> => {
    const response = await apiClient.get<OrderCustomField[]>('')
    return response.data
  },

  getFieldById: async (id: string): Promise<OrderCustomField> => {
    const response = await apiClient.get<OrderCustomField>(`/${id}`)
    return response.data
  },

  createField: async (fieldDTO: CreateOrderCustomFieldDTO): Promise<OrderCustomField> => {
    try {
      const response = await apiClient.post<OrderCustomField>('', fieldDTO)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      console.error('Failed to create order custom field:', axiosError.response?.data?.message || error)
      throw error
    }
  },

  updateField: async (
    id: string,
    fieldDTO: UpdateOrderCustomFieldDTO,
  ): Promise<OrderCustomField> => {
    try {
      const response = await apiClient.put<OrderCustomField>(`/${id}`, fieldDTO)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      console.error('Failed to update order custom field:', axiosError.response?.data?.message || error)
      throw error
    }
  },

  deleteField: async (id: string): Promise<void> => {
    await apiClient.delete(`/${id}`)
  },
}
