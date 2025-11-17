import type { Order, OrderItem, OrderStatus, OrderFilters } from '@/types/order.types'
import type { CartItem } from '@/types/cart.types'
import { mockProducts } from '@/services/mock/products.mock'
import { mockUsers } from '@/services/mock/auth.mock'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

const ORDERS_STORAGE_KEY = 'user_orders'

// Получить все заказы из localStorage
const getAllOrders = (): Order[] => {
  try {
    const data = localStorage.getItem(ORDERS_STORAGE_KEY)
    return data ? (JSON.parse(data) as Order[]) : []
  } catch {
    return []
  }
}

// Сохранить все заказы в localStorage
const saveAllOrders = (orders: Order[]): void => {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
  } catch (error) {
    console.error('Error saving orders:', error)
  }
}

// Получить статус заказа на русском
export const getOrderStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    new: 'Новый',
    pending: 'Ожидает подтверждения',
    confirmed: 'Подтверждён',
    in_progress: 'В работе',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  }
  return labels[status] || status
}

// Получить цвет статуса для отображения
export const getOrderStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    new: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    in_progress: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-200 text-green-900',
    cancelled: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const ordersApi = {
  // Получить список заказов с фильтрацией
  async getOrders(userId: string, companyId?: string, filters?: OrderFilters): Promise<Order[]> {
    await delay()

    let orders = getAllOrders()

    // Фильтрация по компании
    if (companyId) {
      orders = orders.filter((order) => order.companyId === companyId)
    }

    // Фильтрация по создателю (для обычных пользователей)
    if (!companyId) {
      orders = orders.filter((order) => order.createdBy === userId)
    }

    // Применяем дополнительные фильтры
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        orders = orders.filter((order) => filters.status!.includes(order.status))
      }

      if (filters.dateFrom) {
        orders = orders.filter((order) => order.createdAt >= filters.dateFrom!)
      }

      if (filters.dateTo) {
        orders = orders.filter((order) => order.createdAt <= filters.dateTo!)
      }
    }

    // Сортировка по дате создания (новые первыми)
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return orders
  },

  // Получить заказ по ID
  async getOrderById(orderId: string): Promise<Order | null> {
    await delay()

    const orders = getAllOrders()
    return orders.find((order) => order.id === orderId) || null
  },

  // Создать заказ из корзины
  async createOrder(
    userId: string,
    companyId: string,
    companyName: string,
    cartItems: CartItem[],
    notes?: string,
  ): Promise<Order> {
    await delay()

    if (cartItems.length === 0) {
      throw new Error('Корзина пуста')
    }

    const user = mockUsers.find((u) => u.id === userId)
    if (!user) {
      throw new Error('Пользователь не найден')
    }

    // Создаём items заказа
    const orderItems: OrderItem[] = cartItems.map((item) => {
      const product = mockProducts.find((p) => p.id === item.productId)
      return {
        id: `order-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        price: product ? product.price : 0,
        isFromStock: item.isFromStock,
      }
    })

    // Рассчитываем общую стоимость
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Создаём заказ
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      companyId,
      companyName,
      createdBy: userId,
      createdByName: user.fullName,
      status: 'new' as OrderStatus,
      items: orderItems,
      total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes,
    }

    const orders = getAllOrders()
    orders.push(newOrder)
    saveAllOrders(orders)

    return newOrder
  },

  // Обновить статус заказа
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    await delay()

    const orders = getAllOrders()
    const order = orders.find((o) => o.id === orderId)

    if (!order) {
      throw new Error('Заказ не найден')
    }

    order.status = status
    order.updatedAt = new Date().toISOString()

    saveAllOrders(orders)
    return order
  },

  // Отменить заказ
  async cancelOrder(orderId: string): Promise<Order> {
    await delay()

    const orders = getAllOrders()
    const order = orders.find((o) => o.id === orderId)

    if (!order) {
      throw new Error('Заказ не найден')
    }

    if (order.status === 'cancelled') {
      throw new Error('Заказ уже отменён')
    }

    if (['delivered', 'shipped'].includes(order.status)) {
      throw new Error('Невозможно отменить доставленный или отправленный заказ')
    }

    order.status = 'cancelled' as OrderStatus
    order.updatedAt = new Date().toISOString()

    saveAllOrders(orders)
    return order
  },

  // Назначить менеджера на заказ (для админов)
  async assignManager(orderId: string, managerId: string, managerName: string): Promise<Order> {
    await delay()

    const orders = getAllOrders()
    const order = orders.find((o) => o.id === orderId)

    if (!order) {
      throw new Error('Заказ не найден')
    }

    order.assignedManager = managerId
    order.assignedManagerName = managerName
    order.updatedAt = new Date().toISOString()

    saveAllOrders(orders)
    return order
  },

  // Получить статистику по заказам
  async getOrdersStats(companyId?: string): Promise<{
    total: number
    new: number
    inProgress: number
    completed: number
    cancelled: number
  }> {
    await delay()

    let orders = getAllOrders()

    if (companyId) {
      orders = orders.filter((order) => order.companyId === companyId)
    }

    return {
      total: orders.length,
      new: orders.filter((o) => o.status === 'new').length,
      inProgress: orders.filter((o) =>
        ['pending', 'confirmed', 'in_progress', 'shipped'].includes(o.status),
      ).length,
      completed: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    }
  },
}
