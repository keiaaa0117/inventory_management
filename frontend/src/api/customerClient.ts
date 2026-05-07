import axios, { AxiosError } from 'axios'
import { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_URL = `${API_BASE_URL}/api/customers`

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const customerApi = {
  // 全顧客一覧を取得
  getAllCustomers: async (): Promise<Customer[]> => {
    try {
      const response = await apiClient.get<Customer[]>('')
      return response.data
    } catch (error) {
      console.error('Failed to fetch customers:', error)
      throw error
    }
  },

  // 顧客詳細を取得
  getCustomerById: async (id: string): Promise<Customer> => {
    try {
      const response = await apiClient.get<Customer>(`/${id}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch customer:', error)
      throw error
    }
  },

  // 顧客を作成
  createCustomer: async (customerDTO: CreateCustomerDTO): Promise<Customer> => {
    try {
      const response = await apiClient.post<Customer>('', customerDTO)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      console.error('Failed to create customer:', axiosError.response?.data?.message || error)
      throw error
    }
  },

  // 顧客を更新
  updateCustomer: async (id: string, customerDTO: UpdateCustomerDTO): Promise<Customer> => {
    try {
      const response = await apiClient.put<Customer>(`/${id}`, customerDTO)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      console.error('Failed to update customer:', axiosError.response?.data?.message || error)
      throw error
    }
  },

  // 顧客を削除
  deleteCustomer: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/${id}`)
    } catch (error) {
      console.error('Failed to delete customer:', error)
      throw error
    }
  },
}
