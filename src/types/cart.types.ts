import type { Series } from './product.types'

export interface CartItem {
  id: string
  seriesId: string
  series: Series
  quantity: number
}

export interface CartState {
  items: CartItem[]
  loading: boolean
}
