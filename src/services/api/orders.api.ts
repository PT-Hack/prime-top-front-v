import type { Order, OrderStatus, CreateOrderData } from '@/types/order.types'
import { apiClient } from './client'

interface OrdersResponse {
  data: Order[]
}

interface CreateOrderResponse {
  message: string
  order: Order
}

interface UpdateOrderResponse {
  message: string
  data: Order
}

// Преобразуем ответ сервера в Order
const mapOrderResponse = (orderData: any): Order => {
  return {
    id: String(orderData.id),
    date: orderData.date || orderData.created_at,
    user_id: String(orderData.user_id),
    company_id: String(orderData.company_id),
    status: mapOrderStatus(orderData.status),
    user: orderData.user,
    series: orderData.series?.map((s: any) => ({
      order_id: String(orderData.id),
      series_id: String(s.series_id || s.id),
      amount: s.amount || s.pivot?.amount || 0,
      series: s.series || s,
    })) || [],
  }
}

// Преобразуем статус заказа
const mapOrderStatus = (status: string): OrderStatus => {
  const statusMap: Record<string, OrderStatus> = {
    'pending': OrderStatus.PENDING,
    'accepted': OrderStatus.ACCEPTED,
    'rejected': OrderStatus.REJECTED,
    'canceled': OrderStatus.CANCELED,
    'Обрабатывается': OrderStatus.PENDING,
  }
  
  return statusMap[status.toLowerCase()] || OrderStatus.PENDING
}

export const ordersApi = {
  async getOrders(filters?: { company_id?: string; user_id?: string }): Promise<Order[]> {
    const response = await apiClient.get<OrdersResponse>('/orders')
    
    let orders = (response.data || []).map(mapOrderResponse)
    
    // Фильтрация на клиенте если нужно
    if (filters?.company_id) {
      orders = orders.filter((order) => order.company_id === filters.company_id)
    }
    
    if (filters?.user_id) {
      orders = orders.filter((order) => order.user_id === filters.user_id)
    }
    
    return orders
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const response = await apiClient.get<OrdersResponse>('/orders')
      const order = response.data?.find((o: any) => String(o.id) === orderId)
      return order ? mapOrderResponse(order) : null
    } catch (error) {
      console.error('Error fetching order:', error)
      return null
    }
  },

  async createOrder(data: CreateOrderData): Promise<Order> {
    const response = await apiClient.post<CreateOrderResponse>('/orders', data)
    return mapOrderResponse(response.order)
  },

  async updateOrder(orderId: string, data: { status?: OrderStatus }): Promise<Order> {
    const response = await apiClient.put<UpdateOrderResponse>(`/orders/${orderId}`, data)
    return mapOrderResponse(response.data)
  },

  async cancelOrder(orderId: string): Promise<Order> {
    return this.updateOrder(orderId, { status: OrderStatus.CANCELED })
  },
}
