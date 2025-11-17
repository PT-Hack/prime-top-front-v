import type { User } from '@/types/auth.types'
import { UserRole } from '@/types/auth.types'

export const mockUsers: User[] = [
  {
    id: 'user-001',
    email: 'guest@example.com',
    fullName: 'Гость',
    role: UserRole.GUEST,
    createdAt: '2025-01-01T00:00:00Z',
    notificationSettings: {
      email: false,
      push: false,
      sms: false,
    },
  },
  {
    id: 'user-002',
    email: 'ivan.ivanov@example.com',
    fullName: 'Иванов Иван Иванович',
    role: UserRole.USER,
    createdAt: '2025-01-15T10:00:00Z',
    avatar: '/images/avatars/default.jpg',
    phone: '+79001234567',
    notificationSettings: {
      email: true,
      push: true,
      sms: false,
    },
  },
  {
    id: 'user-003',
    email: 'manager@tehcom.ru',
    fullName: 'Петров Петр Петрович',
    role: UserRole.COMPANY_MANAGER,
    companyId: 'company-001',
    createdAt: '2025-02-01T09:00:00Z',
    avatar: '/images/avatars/default.jpg',
    phone: '+79001234568',
    notificationSettings: {
      email: true,
      push: true,
      sms: true,
    },
  },
  {
    id: 'user-004',
    email: 'admin@tehcom.ru',
    fullName: 'Сидоров Сидор Сидорович',
    role: UserRole.COMPANY_ADMIN,
    companyId: 'company-001',
    createdAt: '2025-02-01T08:00:00Z',
    avatar: '/images/avatars/default.jpg',
    phone: '+79001234569',
    notificationSettings: {
      email: true,
      push: true,
      sms: true,
    },
  },
  {
    id: 'user-005',
    email: 'system.manager@primetop.ru',
    fullName: 'Кузнецов Алексей Владимирович',
    role: UserRole.SYSTEM_MANAGER,
    createdAt: '2024-12-01T00:00:00Z',
    avatar: '/images/avatars/default.jpg',
    phone: '+79001234570',
    notificationSettings: {
      email: true,
      push: true,
      sms: true,
    },
  },
  {
    id: 'user-006',
    email: 'system.admin@primetop.ru',
    fullName: 'Смирнов Дмитрий Александрович',
    role: UserRole.SYSTEM_ADMIN,
    createdAt: '2024-11-01T00:00:00Z',
    avatar: '/images/avatars/default.jpg',
    phone: '+79001234571',
    notificationSettings: {
      email: true,
      push: true,
      sms: true,
    },
  },
  {
    id: 'user-007',
    email: 'manager2@tehcom.ru',
    fullName: 'Волков Михаил Игоревич',
    role: UserRole.COMPANY_MANAGER,
    companyId: 'company-001',
    createdAt: '2025-03-01T10:00:00Z',
    avatar: '/images/avatars/default.jpg',
    phone: '+79001234572',
    notificationSettings: {
      email: true,
      push: false,
      sms: false,
    },
  },
  {
    id: 'user-008',
    email: 'manager@pktcom.ru',
    fullName: 'Орлов Андрей Сергеевич',
    role: UserRole.COMPANY_MANAGER,
    companyId: 'company-002',
    createdAt: '2025-02-15T11:00:00Z',
    avatar: '/images/avatars/default.jpg',
    phone: '+79001234573',
    notificationSettings: {
      email: true,
      push: true,
      sms: false,
    },
  },
  {
    id: 'user-009',
    email: 'admin@pktcom.ru',
    fullName: 'Лебедев Николай Викторович',
    role: UserRole.COMPANY_ADMIN,
    companyId: 'company-002',
    createdAt: '2025-02-15T10:00:00Z',
    avatar: '/images/avatars/default.jpg',
    phone: '+79001234574',
    notificationSettings: {
      email: true,
      push: true,
      sms: true,
    },
  },
  {
    id: 'user-010',
    email: 'system.manager2@primetop.ru',
    fullName: 'Морозов Владимир Павлович',
    role: UserRole.SYSTEM_MANAGER,
    createdAt: '2024-12-15T00:00:00Z',
    avatar: '/images/avatars/default.jpg',
    phone: '+79001234575',
    notificationSettings: {
      email: true,
      push: true,
      sms: false,
    },
  },
]

export const getMockUserById = (id: string): User | undefined => {
  return mockUsers.find((u) => u.id === id)
}

export const getMockUsersByRole = (role: UserRole): User[] => {
  return mockUsers.filter((u) => u.role === role)
}

export const getMockUsersByCompany = (companyId: string): User[] => {
  return mockUsers.filter((u) => u.companyId === companyId)
}

// Для тестирования авторизации
export const mockAuthCredentials = {
  // Менеджер компании
  manager: {
    login: 'manager@tehcom.ru',
    password: 'password123',
  },
  // Админ компании
  companyAdmin: {
    login: 'admin@tehcom.ru',
    password: 'password123',
  },
  // Менеджер системы
  systemManager: {
    login: 'system.manager@primetop.ru',
    password: 'password123',
  },
  // Админ системы
  systemAdmin: {
    login: 'system.admin@primetop.ru',
    password: 'password123',
  },
  // Обычный пользователь
  user: {
    login: 'ivan.ivanov@example.com',
    password: 'password123',
  },
}
