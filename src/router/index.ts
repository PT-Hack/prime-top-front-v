import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/types/auth.types'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public routes
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/Login.vue'),
      meta: { requiresAuth: false, guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/Register.vue'),
      meta: { requiresAuth: false, guestOnly: true },
    },

    // Protected routes
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false }, // Home доступна всем
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../views/products/ProductsList.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/products/:id',
      name: 'product-details',
      component: () => import('../views/products/ProductDetails.vue'),
      meta: { requiresAuth: false },
    },

    // User routes (требуют авторизации)
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/user/Profile.vue'),
      meta: { requiresAuth: true, requiredRole: UserRole.CLIENT_MANAGER },
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('../views/user/Favorites.vue'),
      meta: { requiresAuth: true, requiredRole: UserRole.CLIENT_MANAGER },
    },

    // Company routes (требуют компанию)
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/cart/Cart.vue'),
      meta: { requiresAuth: true, requiredRole: UserRole.CLIENT_MANAGER },
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/orders/OrdersList.vue'),
      meta: { requiresAuth: true, requiredRole: UserRole.CLIENT_MANAGER },
    },
    {
      path: '/orders/:id',
      name: 'order-details',
      component: () => import('../views/orders/OrderDetails.vue'),
      meta: { requiresAuth: true, requiredRole: UserRole.CLIENT_MANAGER },
    },
    {
      path: '/company',
      name: 'company',
      component: () => import('../views/company/CompanyProfile.vue'),
      meta: { requiresAuth: true, requiredRole: UserRole.CLIENT_MANAGER },
    },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('../views/messages/Messages.vue'),
      meta: { requiresAuth: true, requiredRole: UserRole.CLIENT_MANAGER },
    },

    // Admin routes - только для system roles
    {
      path: '/companies',
      name: 'companies',
      component: () => import('../views/admin/CompaniesList.vue'),
      meta: { requiresAuth: true, requiredRole: UserRole.SYSTEM_MANAGER, systemOnly: true },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/admin/UsersList.vue'),
      meta: { requiresAuth: true, requiredRole: UserRole.SYSTEM_ADMIN, systemOnly: true },
    },

    // 404
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound.vue'),
    },
  ],
})

// Navigation guards
router.beforeEach(
  async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const authStore = useAuthStore()

    // Инициализируем auth store при первой загрузке
    if (!authStore.currentUser && localStorage.getItem('authToken')) {
      try {
        await authStore.initAuth()
      } catch (error) {
        console.error('Failed to initialize auth:', error)
      }
    }

    const requiresAuth = to.meta.requiresAuth
    const guestOnly = to.meta.guestOnly
    const requiredRole = to.meta.requiredRole as UserRole | undefined

    // Если маршрут только для гостей (login, register) и пользователь авторизован
    if (guestOnly && authStore.isAuthenticated) {
      next({ name: 'home' })
      return
    }

    // Если маршрут требует авторизации
    if (requiresAuth && !authStore.isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    // Проверка роли
    if (requiredRole && authStore.userRole) {
      const hasPermission = hasRequiredRole(authStore.userRole, requiredRole)
      if (!hasPermission) {
        next({ name: 'home' })
        return
      }
    }

    next()
  },
)

// Вспомогательная функция для проверки иерархии ролей
function hasRequiredRole(userRole: string | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false
  
  const hierarchy: Record<string, number> = {
    [UserRole.CLIENT_MANAGER]: 1,
    [UserRole.CLIENT_ADMIN]: 2,
    [UserRole.SYSTEM_MANAGER]: 3,
    [UserRole.SYSTEM_ADMIN]: 4,
  }

  return (hierarchy[userRole] || 0) >= (hierarchy[requiredRole] || 0)
}

export default router
