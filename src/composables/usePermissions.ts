import { computed } from 'vue'
import { useAuth } from './useAuth'
import { permissions } from '@/utils/permissions'
import { UserRole } from '@/types/auth.types'

export function usePermissions() {
  const { userRole, hasCompany } = useAuth()

  const canViewProducts = computed(() => {
    return permissions.canViewProducts(userRole.value || UserRole.GUEST)
  })

  const canAddToFavorites = computed(() => {
    return permissions.canAddToFavorites(userRole.value || UserRole.GUEST)
  })

  const canAddToCart = computed(() => {
    return permissions.canAddToCart(userRole.value || UserRole.GUEST)
  })

  const canCreateOrders = computed(() => {
    return permissions.canCreateOrders(userRole.value || UserRole.GUEST)
  })

  const canCancelOrders = computed(() => {
    return permissions.canCancelOrders(userRole.value || UserRole.GUEST)
  })

  const canProcessOrders = computed(() => {
    return permissions.canProcessOrders(userRole.value || UserRole.GUEST)
  })

  const canCreateCompany = computed(() => {
    return permissions.canCreateCompany(
      userRole.value || UserRole.GUEST,
      hasCompany.value,
    )
  })

  const canManageCompany = computed(() => {
    return permissions.canManageCompany(userRole.value || UserRole.GUEST)
  })

  const canViewCompanies = computed(() => {
    return permissions.canViewCompanies(userRole.value || UserRole.GUEST)
  })

  const canManageUsers = computed(() => {
    return permissions.canManageUsers(userRole.value || UserRole.GUEST)
  })

  const canChatWithSupport = computed(() => {
    return permissions.canChatWithSupport(userRole.value || UserRole.GUEST)
  })

  const canChatWithCompany = computed(() => {
    return permissions.canChatWithCompany(userRole.value || UserRole.GUEST)
  })

  const canChatAboutOrder = computed(() => {
    return permissions.canChatAboutOrder(userRole.value || UserRole.GUEST)
  })

  // Дополнительные разрешения для навигации
  const canViewFavorites = computed(() => {
    return permissions.canAddToFavorites(userRole.value || UserRole.GUEST)
  })

  const canManageCart = computed(() => {
    return permissions.canAddToCart(userRole.value || UserRole.GUEST)
  })

  const canViewOrders = computed(() => {
    return permissions.canCreateOrders(userRole.value || UserRole.GUEST) ||
           permissions.canProcessOrders(userRole.value || UserRole.GUEST)
  })

  const canViewCompany = computed(() => {
    return permissions.canManageCompany(userRole.value || UserRole.GUEST)
  })

  const canViewUsers = computed(() => {
    return permissions.canManageUsers(userRole.value || UserRole.GUEST)
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
