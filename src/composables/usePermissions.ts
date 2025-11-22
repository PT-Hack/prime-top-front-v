import { computed } from 'vue'
import { useAuth } from './useAuth'
import { permissions } from '@/utils/permissions'
import { UserRole } from '@/types/auth.types'

export function usePermissions() {
  const { userRole, hasCompany } = useAuth()

  const canViewProducts = computed(() => {
    return permissions.canViewProducts((userRole.value as UserRole) || UserRole.CLIENT_MANAGER)
  })

  const canAddToFavorites = computed(() => {
    return permissions.canAddToFavorites((userRole.value as UserRole) || UserRole.CLIENT_MANAGER)
  })

  const canAddToCart = computed(() => {
    return permissions.canAddToCart((userRole.value as UserRole) || UserRole.CLIENT_MANAGER)
  })

  const canCreateOrders = computed(() => {
    return permissions.canCreateOrders((userRole.value as UserRole) || UserRole.CLIENT_MANAGER)
  })

  const canCancelOrders = computed(() => {
    return permissions.canCancelOrders((userRole.value as UserRole) || UserRole.CLIENT_MANAGER)
  })

  const canProcessOrders = computed(() => {
    return permissions.canProcessOrders((userRole.value as UserRole) || UserRole.CLIENT_MANAGER)
  })

  const canCreateCompany = computed(() => {
    return permissions.canCreateCompany(
      (userRole.value as UserRole) || UserRole.CLIENT_MANAGER,
      hasCompany.value,
    )
  })

  const canManageCompany = computed(() => {
    return permissions.canManageCompany((userRole.value as UserRole) || UserRole.CLIENT_MANAGER)
  })

  const canViewCompanies = computed(() => {
    return permissions.canViewCompanies((userRole.value as UserRole) || UserRole.CLIENT_MANAGER)
  })

  const canManageUsers = computed(() => {
    return permissions.canManageUsers((userRole.value as UserRole) || UserRole.CLIENT_MANAGER)
  })

  const canChatWithSupport = computed(() => {
    return permissions.canChatWithSupport((userRole.value as UserRole) || UserRole.CLIENT_MANAGER)
  })

  const canChatWithCompany = computed(() => {
    return permissions.canChatWithCompany((userRole.value as UserRole) || UserRole.CLIENT_MANAGER)
  })

  const canChatAboutOrder = computed(() => {
    return permissions.canChatAboutOrder((userRole.value as UserRole) || UserRole.CLIENT_MANAGER)
  })

  // Дополнительные разрешения для навигации
  const canViewFavorites = computed(() => {
    return permissions.canAddToFavorites((userRole.value as UserRole) || UserRole.CLIENT_MANAGER)
  })

  const canManageCart = computed(() => {
    return permissions.canAddToCart((userRole.value as UserRole) || UserRole.CLIENT_MANAGER)
  })

  const canViewOrders = computed(() => {
    return permissions.canCreateOrders((userRole.value as UserRole) || UserRole.CLIENT_MANAGER) ||
           permissions.canProcessOrders((userRole.value as UserRole) || UserRole.CLIENT_MANAGER)
  })

  const canViewCompany = computed(() => {
    return permissions.canManageCompany((userRole.value as UserRole) || UserRole.CLIENT_MANAGER)
  })

  const canViewUsers = computed(() => {
    return permissions.canManageUsers((userRole.value as UserRole) || UserRole.CLIENT_MANAGER)
  })

  return {
    canViewProducts,
    canAddToFavorites,
    canAddToCart,
    canCreateOrders,
    canCancelOrders,
    canProcessOrders,
    canCreateCompany,
    canManageCompany,
    canViewCompanies,
    canManageUsers,
    canChatWithSupport,
    canChatWithCompany,
    canChatAboutOrder,
    canViewFavorites,
    canManageCart,
    canViewOrders,
    canViewCompany,
    canViewUsers,
  }
}
