import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import type { AuthCredentials, RegisterData } from '@/types/auth.types'

export function useAuth() {
  const authStore = useAuthStore()
  const { currentUser, isAuthenticated, loading } = storeToRefs(authStore)

  const login = async (credentials: AuthCredentials) => {
    return authStore.login(credentials)
  }

  const register = async (data: RegisterData) => {
    return authStore.register(data)
  }

  const logout = async () => {
    return authStore.logout()
  }

  const userRole = computed(() => currentUser.value?.role?.title)
  const hasCompany = computed(() => !!currentUser.value?.company_id)

  return {
    currentUser,
    isAuthenticated,
    loading,
    userRole,
    hasCompany,
    login,
    register,
    logout,
  }
}
