export enum UserRole {
  SYSTEM_ADMIN = 'system-admin',
  SYSTEM_MANAGER = 'system-manager',
  CLIENT_ADMIN = 'client-admin',
  CLIENT_MANAGER = 'client-manager',
}

export interface Role {
  id: number
  title: string
  description: string
}

export interface User {
  id: string
  last_name: string
  first_name: string
  patronymic?: string | null
  email: string
  role_id: number
  company_id?: string | null
  email_verified_at?: string | null
  role?: Role
  company?: {
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
  }
}


export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterData {
  last_name: string
  first_name: string
  patronymic?: string | null
  email: string
  password: string
  password_confirmation: string
}

export interface VerifyData {
  user_id: string
  code: string
}

export interface AuthState {
  currentUser: User | null
  isAuthenticated: boolean
  loading: boolean
}
