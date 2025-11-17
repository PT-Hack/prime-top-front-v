export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  COMPANY_MANAGER = 'company_manager',
  COMPANY_ADMIN = 'company_admin',
  SYSTEM_MANAGER = 'system_manager',
  SYSTEM_ADMIN = 'system_admin',
}

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  companyId?: string
  createdAt: string
  avatar?: string
  phone?: string
  notificationSettings: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

export interface AuthCredentials {
  login: string
  password: string
}

export interface RegisterData {
  login: string
  password: string
  passwordConfirm?: string
  fullName: string
  phone?: string
  agreeToTerms?: boolean
}

export interface AuthState {
  currentUser: User | null
  isAuthenticated: boolean
  loading: boolean
}
