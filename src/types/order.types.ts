import type { Product } from './product.types'

export enum OrderStatus {
  NEW = 'new',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface OrderItem {
  id: string
  productId: string
  product: Product
  quantity: number
  price: number
  isFromStock: boolean
}

export interface Order {
  id: string
  companyId: string
  companyName: string
  createdBy: string
  createdByName: string
  assignedManager?: string
  assignedManagerName?: string
  status: OrderStatus
  items: OrderItem[]
  total: number
  createdAt: string
  updatedAt: string
  notes?: string
}

export interface OrderFilters {
  status?: OrderStatus[]
  companyId?: string
  dateFrom?: string
  dateTo?: string
}

export interface OrdersState {
  orders: Order[]
  currentOrder: Order | null
  filters: OrderFilters
  loading: boolean
}
