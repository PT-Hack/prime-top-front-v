import type { CartItem } from '@/types/cart.types'
import type { Product } from '@/types/product.types'
import { mockProducts } from '@/services/mock/products.mock'

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

    // Обогащаем данными о продукте из mock
    return cartItems.map((item) => {
      const product = mockProducts.find((p) => p.id === item.productId)
      return {
        ...item,
        product: product || item.product,
      }
    })
  },

  // Добавить товар в корзину
  async addToCart(userId: string, productId: string, quantity: number): Promise<CartItem[]> {
    await delay()

    const product = mockProducts.find((p) => p.id === productId)
    if (!product) {
      throw new Error('Товар не найден')
    }

    const cartItems = getCartData(userId)
    const existingItem = cartItems.find((item) => item.productId === productId)

    if (existingItem) {
      // Увеличиваем количество существующего товара
      existingItem.quantity += quantity

      // Проверка на доступное количество
      if (existingItem.quantity > product.stock) {
        throw new Error(`Доступно только ${product.stock} кг`)
      }
    } else {
      // Добавляем новый товар
      if (quantity > product.stock) {
        throw new Error(`Доступно только ${product.stock} кг`)
      }

      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: product.id,
        product: product,
        quantity: quantity,
        isFromStock: product.isInStock,
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

    const product = mockProducts.find((p) => p.id === item.productId)
    if (!product) {
      throw new Error('Товар не найден')
    }

    if (quantity <= 0) {
      throw new Error('Количество должно быть больше 0')
    }

    if (quantity > product.stock) {
      throw new Error(`Доступно только ${product.stock} кг`)
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
    return cartItems.reduce((total, item) => {
      const product = mockProducts.find((p) => p.id === item.productId)
      return total + (product ? product.price * item.quantity : 0)
    }, 0)
  },
}
