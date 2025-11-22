import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/services/api/auth.api'
import type { User, AuthCredentials, RegisterData } from '@/types/auth.types'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => currentUser.value !== null)
  const userRole = computed(() => currentUser.value?.role?.title)
  const hasCompany = computed(() => !!currentUser.value?.company_id)

  const login = async (credentials: AuthCredentials) => {
    loading.value = true
    try {
      currentUser.value = await authApi.login(credentials)
      return currentUser.value
    } finally {
      loading.value = false
    }
  }

  const register = async (data: RegisterData) => {
    loading.value = true
    try {
      const response = await authApi.register(data)
      // register возвращает { user_id, message }, нужно вызвать verify для получения пользователя
      return response
    } finally {
      loading.value = false
    }
  }

  const verify = async (data: { user_id: string; code: string }) => {
    loading.value = true
    try {
      currentUser.value = await authApi.verify(data)
      return currentUser.value
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      await authApi.logout()
      currentUser.value = null
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser.value) return

    loading.value = true
    try {
      currentUser.value = await authApi.updateProfile(currentUser.value.id, data)
      return currentUser.value
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!currentUser.value) return

    loading.value = true
    try {
      await authApi.changePassword(currentUser.value.id, oldPassword, newPassword)
    } finally {
      loading.value = false
    }
  }

  const initAuth = async () => {
    loading.value = true
    try {
      const user = await authApi.getCurrentUser()
      if (user) {
        currentUser.value = user
      }
    } finally {
      loading.value = false
    }
  }

  return {
    currentUser,
    loading,
    isAuthenticated,
    userRole,
    hasCompany,
    login,
    register,
    verify,
    logout,
    updateProfile,
    changePassword,
    initAuth,
  }
})
