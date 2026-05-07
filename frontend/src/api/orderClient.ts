import axios, { AxiosError } from 'axios'
import { Order, CreateOrderDTO, UpdateOrderDTO } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_URL = `${API_BASE_URL}/api/orders`

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const orderApi = {
  // 全注文一覧を取得
  getAllOrders: async (): Promise<Order[]> => {
    try {
      const response = await apiClient.get<Order[]>('')
      return response.data
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      throw error
    }
  },

  // 注文詳細を取得
  getOrderById: async (id: string): Promise<Order> => {
    try {
      const response = await apiClient.get<Order>(`/${id}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch order:', error)
      throw error
    }
  },

  // ステータスで注文を取得
  getOrdersByStatus: async (status: string): Promise<Order[]> => {
    try {
      const response = await apiClient.get<Order[]>(`/status/${status}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch orders by status:', error)
      throw error
    }
  },

  // 顧客の注文を取得
  getOrdersByCustomerId: async (customerId: string): Promise<Order[]> => {
    try {
      const response = await apiClient.get<Order[]>(`/customer/${customerId}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch orders by customer:', error)
      throw error
    }
  },

  // カレンダー用に日付範囲で注文を取得
  getOrdersByDateRange: async (start: string, end: string): Promise<Order[]> => {
    try {
      const response = await apiClient.get<Order[]>(`/calendar`, {
        params: { start, end },
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch orders by date range:', error)
      throw error
    }
  },

  // 近期納期の注文を取得
  getUpcomingOrders: async (days: number = 3): Promise<Order[]> => {
    try {
      const response = await apiClient.get<Order[]>(`/alerts/upcoming`, {
        params: { days },
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch upcoming orders:', error)
      throw error
    }
  },

  // 注文を作成
  createOrder: async (orderDTO: CreateOrderDTO): Promise<Order> => {
    try {
      const response = await apiClient.post<Order>('', orderDTO)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      console.error('Failed to create order:', axiosError.response?.data?.message || error)
      throw error
    }
  },

  // 注文を更新
  updateOrder: async (id: string, orderDTO: UpdateOrderDTO): Promise<Order> => {
    try {
      const response = await apiClient.put<Order>(`/${id}`, orderDTO)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      console.error('Failed to update order:', axiosError.response?.data?.message || error)
      throw error
    }
  },

  // 注文を削除
  deleteOrder: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/${id}`)
    } catch (error) {
      console.error('Failed to delete order:', error)
      throw error
    }
  },
}
