import type { Product, ProductFilters } from '@/types/product.types'
import {
  mockProducts,
  getMockProductById,
  getMockProductsByCategory,
  getMockProductsInStock,
  getMockProductsOnPromotion,
} from '@/services/mock/products.mock'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const productsApi = {
  async getProducts(filters?: ProductFilters): Promise<{
    products: Product[]
    total: number
  }> {
    await delay()

    let filteredProducts = [...mockProducts]

    // Применяем фильтры
    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredProducts = filteredProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.nomenclatureName.toLowerCase().includes(searchLower) ||
            p.ralColor.toLowerCase().includes(searchLower),
        )
      }

      if (filters.categories && filters.categories.length > 0) {
        filteredProducts = filteredProducts.filter((p) =>
          filters.categories!.includes(p.category),
        )
      }

      if (filters.ralColors && filters.ralColors.length > 0) {
        filteredProducts = filteredProducts.filter((p) =>
          filters.ralColors!.includes(p.ralColor),
        )
      }

      if (filters.inStock) {
        filteredProducts = filteredProducts.filter(
          (p) => p.isInStock && p.stock > 0,
        )
      }

      if (filters.priceRange) {
        filteredProducts = filteredProducts.filter(
          (p) =>
            p.price >= filters.priceRange![0] &&
            p.price <= filters.priceRange![1],
        )
      }

      // Сортировка
      if (filters.sortBy) {
        filteredProducts.sort((a, b) => {
          let compareValue = 0

          switch (filters.sortBy) {
            case 'name':
              compareValue = a.name.localeCompare(b.name)
              break
            case 'price':
              compareValue = a.price - b.price
              break
            case 'stock':
              compareValue = a.stock - b.stock
              break
          }

          return filters.sortOrder === 'desc' ? -compareValue : compareValue
        })
      }
    }

    return {
      products: filteredProducts,
      total: filteredProducts.length,
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    await delay()

    return getMockProductById(id) || null
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    await delay()

    return getMockProductsByCategory(category)
  },

  async getProductsInStock(): Promise<Product[]> {
    await delay()

    return getMockProductsInStock()
  },

  async getProductsOnPromotion(): Promise<Product[]> {
    await delay()

    return getMockProductsOnPromotion()
  },
}
