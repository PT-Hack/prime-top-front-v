import { UserRole } from '@/types/auth.types'
import { OrderStatus } from '@/types/order.types'

export const ROLE_HIERARCHY = {
  [UserRole.CLIENT_MANAGER]: 1,
  [UserRole.CLIENT_ADMIN]: 2,
  [UserRole.SYSTEM_MANAGER]: 3,
  [UserRole.SYSTEM_ADMIN]: 4,
}

export const ROLE_LABELS = {
  [UserRole.CLIENT_MANAGER]: 'Клиент-менеджер',
  [UserRole.CLIENT_ADMIN]: 'Клиент-админ',
  [UserRole.SYSTEM_MANAGER]: 'Менеджер системы',
  [UserRole.SYSTEM_ADMIN]: 'Администратор системы',
}

export const ORDER_STATUS_LABELS = {
  [OrderStatus.PENDING]: 'В ожидании',
  [OrderStatus.ACCEPTED]: 'Принят',
  [OrderStatus.REJECTED]: 'Отклонен',
  [OrderStatus.CANCELED]: 'Отменен',
}

export const ORDER_STATUS_COLORS = {
  [OrderStatus.PENDING]: 'yellow',
  [OrderStatus.ACCEPTED]: 'green',
  [OrderStatus.REJECTED]: 'red',
  [OrderStatus.CANCELED]: 'gray',
}

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 20,
  PER_PAGE_OPTIONS: [10, 20, 50, 100],
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  PRODUCTS: '/products',
  PRODUCT_DETAILS: '/products/:id',
  FAVORITES: '/favorites',
  CART: '/cart',
  ORDERS: '/orders',
  ORDER_DETAILS: '/orders/:id',
  COMPANY: '/company',
  COMPANY_LIST: '/companies',
  MESSAGES: '/messages',
  USERS: '/users',
} as const
