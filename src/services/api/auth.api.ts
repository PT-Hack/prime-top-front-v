import type { AuthCredentials, RegisterData, VerifyData, User } from '@/types/auth.types'
import { apiClient } from './client'

interface LoginResponse {
  token: string
  user: {
    id: string
    last_name: string
    first_name: string
    patronymic?: string | null
    email: string
    role: string
  }
}

interface RegisterResponse {
  message: string
  user_id: string
}

interface VerifyResponse {
  message: string
  token: string
  user: {
    id: string
    last_name: string
    first_name: string
    patronymic?: string | null
    email: string
    role: string
  }
}

// Преобразуем ответ сервера в User
const mapUserResponse = (userData: LoginResponse['user'], token?: string): User => {
  // Определяем role_id на основе role title
  const roleIdMap: Record<string, number> = {
    'system-admin': 1,
    'system-manager': 2,
    'client-admin': 3,
    'client-manager': 4,
  }

  return {
    id: String(userData.id),
    last_name: userData.last_name,
    first_name: userData.first_name,
    patronymic: userData.patronymic || null,
    email: userData.email,
    role_id: roleIdMap[userData.role] || 4,
    company_id: null, // Будет загружено отдельно если нужно
    email_verified_at: null,
    role: {
      id: roleIdMap[userData.role] || 4,
      title: userData.role,
      description: userData.role,
    },
  }
}

export const authApi = {
  async login(credentials: AuthCredentials): Promise<User> {
    const response = await apiClient.post<LoginResponse>(
      '/auth/login',
      credentials,
      { skipAuth: true }
    )

    // Сохраняем токен
    localStorage.setItem('authToken', response.token)
    
    const user = mapUserResponse(response.user, response.token)
    localStorage.setItem('currentUser', JSON.stringify(user))

    return user
  },

  async register(data: RegisterData): Promise<{ user_id: string; message: string }> {
    const response = await apiClient.post<RegisterResponse>(
      '/auth/register',
      data,
      { skipAuth: true }
    )

    return {
      user_id: response.user_id,
      message: response.message,
    }
  },

  async verify(data: VerifyData): Promise<User> {
    const response = await apiClient.post<VerifyResponse>(
      '/auth/verify',
      data,
      { skipAuth: true }
    )

    // Сохраняем токен
    localStorage.setItem('authToken', response.token)
    
    const user = mapUserResponse(response.user, response.token)
    localStorage.setItem('currentUser', JSON.stringify(user))

    return user
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('authToken')
      localStorage.removeItem('currentUser')
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const userJson = localStorage.getItem('currentUser')
    if (!userJson) return null

    try {
      return JSON.parse(userJson)
    } catch {
      return null
    }
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    // В реальном приложении здесь будет запрос к API
    // Пока обновляем локально
    const userJson = localStorage.getItem('currentUser')
    if (userJson) {
      const user = JSON.parse(userJson)
      const updatedUser = { ...user, ...data }
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      return updatedUser
    }
    throw new Error('Пользователь не найден')
  },

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    // В реальном приложении здесь будет запрос к API
    console.log('Password changed for user', userId)
  },
}
