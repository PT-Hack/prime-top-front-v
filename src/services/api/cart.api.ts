import type { CartItem } from '@/types/cart.types'
import type { Series } from '@/types/product.types'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

const CART_STORAGE_KEY = 'user_cart'

// Получить корзину для текущего пользователя
const getCartData = (userId: string): CartItem[] => {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY)
    if (!data) return []

    const allCarts = JSON.parse(data) as Record<string, CartItem[]>
    return allCarts[userId] || []
  } catch {
    return []
  }
}

// Сохранить корзину для текущего пользователя
const saveCartData = (userId: string, items: CartItem[]): void => {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY)
    const allCarts = data ? (JSON.parse(data) as Record<string, CartItem[]>) : {}

    allCarts[userId] = items
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(allCarts))
  } catch (error) {
    console.error('Error saving cart:', error)
  }
}

export const cartApi = {
  // Получить содержимое корзины
  async getCart(userId: string): Promise<CartItem[]> {
    await delay()

    const cartItems = getCartData(userId)
    // Серии уже должны быть в данных корзины
    return cartItems
  },

  // Добавить серию в корзину
  async addToCart(userId: string, seriesId: string, quantity: number): Promise<CartItem[]> {
    await delay()

    // Загружаем серию из API
    const { productsApi } = await import('./products.api')
    const products = await productsApi.getProducts()
    
    // Ищем серию в продуктах
    let series: Series | null = null
    for (const product of products.products) {
      if (product.series) {
        const foundSeries = product.series.find((s) => String(s.id) === seriesId)
        if (foundSeries) {
          series = foundSeries
          break
        }
      }
    }

    if (!series) {
      throw new Error('Серия не найдена')
    }

    const cartItems = getCartData(userId)
    const existingItem = cartItems.find((item) => item.seriesId === seriesId)

    if (existingItem) {
      // Увеличиваем количество существующего товара
      existingItem.quantity += quantity

      // Проверка на доступное количество
      if (series.amount && existingItem.quantity > series.amount) {
        throw new Error(`Доступно только ${series.amount} кг`)
      }
    } else {
      // Добавляем новый товар
      if (series.amount && quantity > series.amount) {
        throw new Error(`Доступно только ${series.amount} кг`)
      }

      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        seriesId: seriesId,
        series: series,
        quantity: quantity,
      }
      cartItems.push(newItem)
    }

    saveCartData(userId, cartItems)
    return cartItems
  },

  // Обновить количество товара в корзине
  async updateCartItem(
    userId: string,
    cartItemId: string,
    quantity: number,
  ): Promise<CartItem[]> {
    await delay()

    const cartItems = getCartData(userId)
    const item = cartItems.find((i) => i.id === cartItemId)

    if (!item) {
      throw new Error('Товар не найден в корзине')
    }

    if (quantity <= 0) {
      throw new Error('Количество должно быть больше 0')
    }

    if (item.series?.amount && quantity > item.series.amount) {
      throw new Error(`Доступно только ${item.series.amount} кг`)
    }

    item.quantity = quantity
    saveCartData(userId, cartItems)

    return cartItems
  },

  // Удалить товар из корзины
  async removeFromCart(userId: string, cartItemId: string): Promise<CartItem[]> {
    await delay()

    const cartItems = getCartData(userId)
    const updatedItems = cartItems.filter((item) => item.id !== cartItemId)

    saveCartData(userId, updatedItems)
    return updatedItems
  },

  // Очистить корзину
  async clearCart(userId: string): Promise<void> {
    await delay()

    saveCartData(userId, [])
  },

  // Получить количество товаров в корзине
  async getCartCount(userId: string): Promise<number> {
    await delay(100)

    const cartItems = getCartData(userId)
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  },

  // Получить общую стоимость корзины
  async getCartTotal(userId: string): Promise<number> {
    await delay(100)

    const cartItems = getCartData(userId)
    // В реальном приложении здесь будет расчет стоимости на основе серий
    // Пока возвращаем 0, так как в сериях нет поля price
    return cartItems.reduce((total, item) => {
      // TODO: Добавить расчет стоимости когда будет поле price в Series
      return total
    }, 0)
  },
}
