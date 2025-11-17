import type { AuthCredentials, RegisterData, User } from '@/types/auth.types'
import { mockUsers, mockAuthCredentials } from '@/services/mock/auth.mock'

// Симуляция задержки сети
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

export const authApi = {
  async login(credentials: AuthCredentials): Promise<User> {
    await delay()

    // Проверка учетных данных
    const user = mockUsers.find((u) => u.email === credentials.login)

    // Простая проверка пароля (в реальном приложении будет хеширование)
    const validCredentials = Object.values(mockAuthCredentials).find(
      (cred) =>
        cred.login === credentials.login && cred.password === credentials.password,
    )

    if (!validCredentials || !user) {
      throw new Error('Неверный логин или пароль')
    }

    // Сохраняем токен в localStorage (заглушка)
    localStorage.setItem('authToken', 'mock-token-' + user.id)
    localStorage.setItem('currentUser', JSON.stringify(user))

    return user
  },

  async register(data: RegisterData): Promise<User> {
    await delay()

    // Проверка на существующего пользователя
    const existingUser = mockUsers.find((u) => u.email === data.login)
    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует')
    }

    // Создание нового пользователя (заглушка)
    const newUser: User = {
      id: 'user-' + Date.now(),
      email: data.login,
      fullName: data.fullName,
      role: 'user' as any,
      createdAt: new Date().toISOString(),
      notificationSettings: {
        email: true,
        push: false,
        sms: false,
      },
    }

    mockUsers.push(newUser)

    localStorage.setItem('authToken', 'mock-token-' + newUser.id)
    localStorage.setItem('currentUser', JSON.stringify(newUser))

    return newUser
  },

  async logout(): Promise<void> {
    await delay(200)

    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(200)

    const userJson = localStorage.getItem('currentUser')
    if (!userJson) return null

    return JSON.parse(userJson)
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    await delay()

    const userIndex = mockUsers.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      throw new Error('Пользователь не найден')
    }

    const updatedUser = { ...mockUsers[userIndex]!, ...data } as User
    mockUsers[userIndex] = updatedUser

    localStorage.setItem('currentUser', JSON.stringify(updatedUser))

    return updatedUser
  },

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    await delay()

    // В реальном приложении проверяем старый пароль и обновляем
    console.log('Password changed for user', userId)
  },
}
