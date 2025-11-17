import type { User, UserRole } from './auth.types'

export interface UsersState {
  users: User[]
  loading: boolean
}

export interface UserFilters {
  role?: UserRole
  companyId?: string
  search?: string
}

export { type User, type UserRole }
