import type { User } from './auth.types'

export interface Company {
  id: string
  title: string
  INN: string
  KPP: string
  OGRN: string
  address: string
  phone: string
  email: string
  checking_account: string
  bank_name: string
  BIK: string
  correspondent_account: string
  users?: User[]
}

export interface CreateCompanyData {
  title: string
  INN: string
  KPP: string
  OGRN: string
  address: string
  phone: string
  email: string
  checking_account: string
  bank_name: string
  BIK: string
  correspondent_account: string
}

export interface UpdateCompanyData {
  title: string
  INN: string
  KPP: string
  OGRN: string
  address: string
  phone: string
  email: string
  checking_account: string
  bank_name: string
  BIK: string
  correspondent_account: string
}

export interface CompaniesState {
  companies: Company[]
  currentCompany: Company | null
  loading: boolean
}
