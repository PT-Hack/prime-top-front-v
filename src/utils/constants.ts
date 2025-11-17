import { UserRole } from '@/types/auth.types'
import { OrderStatus } from '@/types/order.types'

export const ROLE_HIERARCHY = {
  [UserRole.GUEST]: 0,
  [UserRole.USER]: 1,
  [UserRole.COMPANY_MANAGER]: 2,
  [UserRole.COMPANY_ADMIN]: 3,
  [UserRole.SYSTEM_MANAGER]: 2,
  [UserRole.SYSTEM_ADMIN]: 3,
}

export const ROLE_LABELS = {
  [UserRole.GUEST]: 'Посетитель',
  [UserRole.USER]: 'Пользователь',
  [UserRole.COMPANY_MANAGER]: 'Менеджер компании',
  [UserRole.COMPANY_ADMIN]: 'Админ компании',
  [UserRole.SYSTEM_MANAGER]: 'Менеджер системы',
  [UserRole.SYSTEM_ADMIN]: 'Админ системы',
}

export const ORDER_STATUS_LABELS = {
  [OrderStatus.NEW]: 'Новый',
  [OrderStatus.PENDING]: 'В ожидании',
  [OrderStatus.CONFIRMED]: 'Подтвержден',
  [OrderStatus.IN_PROGRESS]: 'В обработке',
  [OrderStatus.SHIPPED]: 'Отправлен',
  [OrderStatus.DELIVERED]: 'Доставлен',
  [OrderStatus.CANCELLED]: 'Отменен',
}

export const ORDER_STATUS_COLORS = {
  [OrderStatus.NEW]: 'blue',
  [OrderStatus.PENDING]: 'yellow',
  [OrderStatus.CONFIRMED]: 'green',
  [OrderStatus.IN_PROGRESS]: 'cyan',
  [OrderStatus.SHIPPED]: 'purple',
  [OrderStatus.DELIVERED]: 'green',
  [OrderStatus.CANCELLED]: 'red',
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
