import { UserRole } from '@/types/auth.types'
import { ROLE_HIERARCHY } from './constants'

export const permissions = {
  // Проверка наличия роли
  hasRole: (userRole: UserRole, requiredRole: UserRole): boolean => {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
  },

  // Проверка одной из ролей
  hasAnyRole: (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
    return requiredRoles.some((role) => permissions.hasRole(userRole, role))
  },

  // Может ли пользователь просматривать товары
  canViewProducts: (userRole: UserRole): boolean => {
    return true // Все могут просматривать
  },

  // Может ли пользователь добавлять в избранное
  canAddToFavorites: (userRole: UserRole): boolean => {
    return permissions.hasAnyRole(userRole, [
      UserRole.CLIENT_MANAGER,
      UserRole.CLIENT_ADMIN,
    ])
  },

  // Может ли пользователь добавлять в корзину
  canAddToCart: (userRole: UserRole): boolean => {
    return permissions.hasAnyRole(userRole, [
      UserRole.CLIENT_MANAGER,
      UserRole.CLIENT_ADMIN,
    ])
  },

  // Может ли пользователь создавать заказы
  canCreateOrders: (userRole: UserRole): boolean => {
    return permissions.hasAnyRole(userRole, [
      UserRole.CLIENT_MANAGER,
      UserRole.CLIENT_ADMIN,
    ])
  },

  // Может ли пользователь отменять заказы
  canCancelOrders: (userRole: UserRole): boolean => {
    return permissions.hasAnyRole(userRole, [
      UserRole.CLIENT_MANAGER,
      UserRole.CLIENT_ADMIN,
    ])
  },

  // Может ли пользователь обрабатывать заказы
  canProcessOrders: (userRole: UserRole): boolean => {
    return permissions.hasAnyRole(userRole, [
      UserRole.SYSTEM_MANAGER,
      UserRole.SYSTEM_ADMIN,
    ])
  },

  // Может ли пользователь создавать компанию
  canCreateCompany: (userRole: UserRole, hasCompany: boolean): boolean => {
    return permissions.hasAnyRole(userRole, [
      UserRole.CLIENT_MANAGER,
      UserRole.CLIENT_ADMIN,
    ]) && !hasCompany
  },

  // Может ли пользователь управлять компанией
  canManageCompany: (userRole: UserRole): boolean => {
    return userRole === UserRole.CLIENT_ADMIN
  },

  // Может ли пользователь просматривать список компаний
  canViewCompanies: (userRole: UserRole): boolean => {
    return permissions.hasAnyRole(userRole, [
      UserRole.SYSTEM_MANAGER,
      UserRole.SYSTEM_ADMIN,
    ])
  },

  // Может ли пользователь управлять пользователями
  canManageUsers: (userRole: UserRole): boolean => {
    return userRole === UserRole.SYSTEM_ADMIN
  },

  // Может ли пользователь писать в чат поддержки
  canChatWithSupport: (userRole: UserRole): boolean => {
    return permissions.hasAnyRole(userRole, [
      UserRole.CLIENT_MANAGER,
      UserRole.CLIENT_ADMIN,
    ])
  },

  // Может ли пользователь писать в чат компании
  canChatWithCompany: (userRole: UserRole): boolean => {
    return permissions.hasAnyRole(userRole, [
      UserRole.CLIENT_MANAGER,
      UserRole.CLIENT_ADMIN,
    ])
  },

  // Может ли пользователь писать в чат по заказу
  canChatAboutOrder: (userRole: UserRole): boolean => {
    return permissions.hasAnyRole(userRole, [
      UserRole.CLIENT_MANAGER,
      UserRole.CLIENT_ADMIN,
      UserRole.SYSTEM_MANAGER,
      UserRole.SYSTEM_ADMIN,
    ])
  },
}
