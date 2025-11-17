import type { Product } from '@/types/product.types'
import { mockProducts } from '@/services/mock/products.mock'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

const FAVORITES_STORAGE_KEY = 'user_favorites'

// Получить избранные ID для текущего пользователя
const getFavoriteIds = (userId: string): string[] => {
  try {
    const data = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!data) return []

    const allFavorites = JSON.parse(data) as Record<string, string[]>
    return allFavorites[userId] || []
  } catch {
    return []
  }
}

// Сохранить избранные ID для текущего пользователя
const saveFavoriteIds = (userId: string, productIds: string[]): void => {
  try {
    const data = localStorage.getItem(FAVORITES_STORAGE_KEY)
    const allFavorites = data ? (JSON.parse(data) as Record<string, string[]>) : {}

    allFavorites[userId] = productIds
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(allFavorites))
  } catch (error) {
    console.error('Error saving favorites:', error)
  }
}

export const favoritesApi = {
  // Получить все избранные товары пользователя
  async getFavorites(userId: string): Promise<Product[]> {
    await delay()

    const favoriteIds = getFavoriteIds(userId)
    const favoriteProducts = mockProducts.filter((p) => favoriteIds.includes(p.id))

    return favoriteProducts
  },

  // Проверить, находится ли товар в избранном
  async isFavorite(userId: string, productId: string): Promise<boolean> {
    await delay(100)

    const favoriteIds = getFavoriteIds(userId)
    return favoriteIds.includes(productId)
  },

  // Добавить товар в избранное
  async addToFavorites(userId: string, productId: string): Promise<void> {
    await delay()

    const favoriteIds = getFavoriteIds(userId)

    if (!favoriteIds.includes(productId)) {
      favoriteIds.push(productId)
      saveFavoriteIds(userId, favoriteIds)
    }
  },

  // Удалить товар из избранного
  async removeFromFavorites(userId: string, productId: string): Promise<void> {
    await delay()

    const favoriteIds = getFavoriteIds(userId)
    const updatedIds = favoriteIds.filter((id) => id !== productId)

    saveFavoriteIds(userId, updatedIds)
  },

  // Переключить статус избранного (добавить/удалить)
  async toggleFavorite(userId: string, productId: string): Promise<boolean> {
    await delay()

    const favoriteIds = getFavoriteIds(userId)
    const isFav = favoriteIds.includes(productId)

    if (isFav) {
      const updatedIds = favoriteIds.filter((id) => id !== productId)
      saveFavoriteIds(userId, updatedIds)
      return false
    } else {
      favoriteIds.push(productId)
      saveFavoriteIds(userId, favoriteIds)
      return true
    }
  },

  // Получить количество товаров в избранном
  async getFavoritesCount(userId: string): Promise<number> {
    await delay(100)

    const favoriteIds = getFavoriteIds(userId)
    return favoriteIds.length
  },
}
