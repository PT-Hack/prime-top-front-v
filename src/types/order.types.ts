import type { Series } from './product.types'
import type { User } from './auth.types'

export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELED = 'canceled',
}

export interface OrderSeries {
  order_id: string
  series_id: string
  amount: number
  series?: Series
}

export interface Order {
  id: string
  date: string
  user_id: string
  company_id: string
  status: OrderStatus
  user?: User
  series?: OrderSeries[]
}

export interface CreateOrderData {
  company_id: string
  user_id: string
  series: Array<{
    id: number
    amount: number
  }>
}

export interface OrderFilters {
  status?: OrderStatus[]
  company_id?: string
  user_id?: string
  date_from?: string
  date_to?: string
}

export interface OrdersState {
  orders: Order[]
  currentOrder: Order | null
  filters: OrderFilters
  loading: boolean
}
