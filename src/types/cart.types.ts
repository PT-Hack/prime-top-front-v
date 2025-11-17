import type { Product } from './product.types'

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  isFromStock: boolean
}

export interface CartState {
  items: CartItem[]
  loading: boolean
}
