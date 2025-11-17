export interface Product {
  id: string
  name: string
  nomenclatureName: string
  ralColor: string
  ralColorHex: string
  image: string
  price: number
  stock: number
  isInStock: boolean
  isPromotion: boolean
  category: string
  description: string
  batchInfo?: BatchInfo
  analysisResults?: AnalysisResults
  estimatedDelivery?: string
}

export interface BatchInfo {
  batchNumber: string
  productionDate: string
  expiryDate: string
}

export interface AnalysisResults {
  quality: string
  composition: Record<string, string>
  certificates: string[]
}

export interface ProductFilters {
  search?: string
  categories?: string[]
  ralColors?: string[]
  inStock?: boolean
  priceRange?: [number, number]
  sortBy?: 'name' | 'price' | 'stock'
  sortOrder?: 'asc' | 'desc'
}

export interface ProductsState {
  products: Product[]
  filters: ProductFilters
  pagination: {
    page: number
    perPage: number
    total: number
  }
  loading: boolean
}
