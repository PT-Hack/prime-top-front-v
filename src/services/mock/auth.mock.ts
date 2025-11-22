import type { User } from '@/types/auth.types'
import { UserRole } from '@/types/auth.types'

export const mockUsers: User[] = [
  {
    id: 'user-002',
    email: 'ivan.ivanov@example.com',
    last_name: 'Иванов',
    first_name: 'Иван',
    patronymic: 'Иванович',
    role_id: 4,
    company_id: null,
    email_verified_at: '2025-01-15T10:00:00Z',
    role: {
      id: 4,
      title: UserRole.CLIENT_MANAGER,
      description: 'Клиент-менеджер',
    },
  },
  {
    id: 'user-003',
    email: 'manager@tehcom.ru',
    last_name: 'Петров',
    first_name: 'Петр',
    patronymic: 'Петрович',
    role_id: 4,
    company_id: 'company-001',
    email_verified_at: '2025-02-01T09:00:00Z',
    role: {
      id: 4,
      title: UserRole.CLIENT_MANAGER,
      description: 'Клиент-менеджер',
    },
  },
  {
    id: 'user-004',
    email: 'admin@tehcom.ru',
    last_name: 'Сидоров',
    first_name: 'Сидор',
    patronymic: 'Сидорович',
    role_id: 3,
    company_id: 'company-001',
    email_verified_at: '2025-02-01T08:00:00Z',
    role: {
      id: 3,
      title: UserRole.CLIENT_ADMIN,
      description: 'Клиент-админ',
    },
  },
  {
    id: 'user-005',
    email: 'system.manager@primetop.ru',
    last_name: 'Кузнецов',
    first_name: 'Алексей',
    patronymic: 'Владимирович',
    role_id: 2,
    company_id: null,
    email_verified_at: '2024-12-01T00:00:00Z',
    role: {
      id: 2,
      title: UserRole.SYSTEM_MANAGER,
      description: 'Менеджер системы',
    },
  },
  {
    id: 'user-006',
    email: 'system.admin@primetop.ru',
    last_name: 'Смирнов',
    first_name: 'Дмитрий',
    patronymic: 'Александрович',
    role_id: 1,
    company_id: null,
    email_verified_at: '2024-11-01T00:00:00Z',
    role: {
      id: 1,
      title: UserRole.SYSTEM_ADMIN,
      description: 'Администратор системы',
    },
  },
]

export const getMockUserById = (id: string): User | undefined => {
  return mockUsers.find((u) => u.id === id)
}

export const getMockUsersByRole = (roleTitle: string): User[] => {
  return mockUsers.filter((u) => u.role?.title === roleTitle)
}

export const getMockUsersByCompany = (companyId: string): User[] => {
  return mockUsers.filter((u) => u.company_id === companyId)
}

// Для тестирования авторизации
export const mockAuthCredentials = {
  // Менеджер компании
  manager: {
    email: 'manager@tehcom.ru',
    password: 'password123',
  },
  // Админ компании
  companyAdmin: {
    email: 'admin@tehcom.ru',
    password: 'password123',
  },
  // Менеджер системы
  systemManager: {
    email: 'system.manager@primetop.ru',
    password: 'password123',
  },
  // Админ системы
  systemAdmin: {
    email: 'system.admin@primetop.ru',
    password: 'password123',
  },
  // Обычный пользователь
  user: {
    email: 'ivan.ivanov@example.com',
    password: 'password123',
  },
}
