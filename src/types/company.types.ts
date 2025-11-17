import type { User, UserRole } from './auth.types'

export interface Company {
  id: string
  name: string
  ogrn: string
  inn: string
  kpp: string
  legalAddress: string
  actualAddress: string
  phone: string
  email: string
  director: string
  status: 'pending' | 'active' | 'rejected'
  createdAt: string
  members: CompanyMember[]
}

export interface CompanyMember {
  userId: string
  user: User
  role: UserRole
  joinedAt: string
}

export interface CreateCompanyData {
  name: string
  ogrn: string
  inn: string
  kpp: string
  legalAddress: string
  actualAddress: string
  phone: string
  email: string
  director: string
}

export interface CompaniesState {
  companies: Company[]
  currentCompany: Company | null
  loading: boolean
}
