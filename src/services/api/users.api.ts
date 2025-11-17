import type { User } from '@/types/auth.types'
import { UserRole } from '@/types/auth.types'
import { mockUsers } from '@/services/mock/users.mock'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const usersApi = {
  async getUsers(): Promise<User[]> {
    await delay()
    return mockUsers
  },

  async getUserById(id: string): Promise<User | null> {
    await delay()
    return mockUsers.find(u => u.id === id) || null
  },

  async deleteUser(id: string): Promise<void> {
    await delay()
    const index = mockUsers.findIndex(u => u.id === id)
    if (index !== -1) {
      mockUsers.splice(index, 1)
    }
  },

  async updateUserRole(userId: string, newRole: UserRole): Promise<User> {
    await delay()

    const user = mockUsers.find(u => u.id === userId)
    if (!user) {
      throw new Error('Пользователь не найден')
    }

    // Обновляем роль
    user.role = newRole

    return user
  },
}
