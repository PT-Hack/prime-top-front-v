import type { Product, ProductFilters } from '@/types/product.types'
import { apiClient } from './client'

interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export const productsApi = {
  async getProducts(filters?: ProductFilters): Promise<{
    products: Product[]
    total: number
  }> {
    const params = new URLSearchParams()
    
    if (filters?.nomenmclature) {
      params.append('nomenmclature', filters.nomenmclature)
    }
    
    if (filters?.shine_heated?.min !== undefined) {
      params.append('shine_heated[min]', String(filters.shine_heated.min))
    }
    
    if (filters?.shine_heated?.max !== undefined) {
      params.append('shine_heated[max]', String(filters.shine_heated.max))
    }
    
    if (filters?.per_page) {
      params.append('per_page', String(filters.per_page))
    }

    const queryString = params.toString()
    const endpoint = queryString ? `/products?${queryString}` : '/products'
    
    const response = await apiClient.get<PaginatedResponse<Product>>(endpoint, { skipAuth: true })
    
    return {
      products: response.data || [],
      total: response.total || 0,
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const product = await apiClient.get<Product>(`/products/${id}`, { skipAuth: true })
      return product
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    const response = await this.getProducts({ nomenmclature: category })
    return response.products
  },

  async getProductsInStock(): Promise<Product[]> {
    // В реальном API может быть отдельный endpoint для товаров в наличии
    const response = await this.getProducts()
    return response.products
  },

  async getProductsOnPromotion(): Promise<Product[]> {
    // В реальном API может быть отдельный endpoint для акционных товаров
    const response = await this.getProducts()
    return response.products
  },
}
