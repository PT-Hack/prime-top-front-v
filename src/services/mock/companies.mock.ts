import type { Company, CompanyMember } from '@/types/company.types'
import { UserRole } from '@/types/auth.types'
import { mockUsers } from './auth.mock'

export const mockCompanies: Company[] = [
  {
    id: 'company-001',
    name: 'Тех ООО',
    ogrn: '1234567890123',
    inn: '1234567890',
    kpp: '123456789',
    legalAddress: 'г. Москва, ул. Ленина, д. 1',
    actualAddress: 'г. Москва, ул. Ленина, д. 1',
    phone: '+7 (495) 123-45-67',
    email: 'info@tehcom.ru',
    director: 'Сидоров Сидор Сидорович',
    status: 'active',
    createdAt: '2025-02-01T00:00:00Z',
    members: [
      {
        userId: 'user-004',
        user: mockUsers[3]!,
        role: UserRole.COMPANY_ADMIN,
        joinedAt: '2025-02-01T08:00:00Z',
      },
      {
        userId: 'user-003',
        user: mockUsers[2]!,
        role: UserRole.COMPANY_MANAGER,
        joinedAt: '2025-02-01T09:00:00Z',
      },
      {
        userId: 'user-007',
        user: mockUsers[6]!,
        role: UserRole.COMPANY_MANAGER,
        joinedAt: '2025-03-01T10:00:00Z',
      },
    ],
  },
  {
    id: 'company-002',
    name: 'ПКТ ООО',
    ogrn: '9876543210987',
    inn: '9876543210',
    kpp: '987654321',
    legalAddress: 'г. Санкт-Петербург, пр. Невский, д. 10',
    actualAddress: 'г. Санкт-Петербург, пр. Невский, д. 10',
    phone: '+7 (812) 234-56-78',
    email: 'info@pktcom.ru',
    director: 'Лебедев Николай Викторович',
    status: 'active',
    createdAt: '2025-02-15T00:00:00Z',
    members: [
      {
        userId: 'user-009',
        user: mockUsers[8]!,
        role: UserRole.COMPANY_ADMIN,
        joinedAt: '2025-02-15T10:00:00Z',
      },
      {
        userId: 'user-008',
        user: mockUsers[7]!,
        role: UserRole.COMPANY_MANAGER,
        joinedAt: '2025-02-15T11:00:00Z',
      },
    ],
  },
  {
    id: 'company-003',
    name: 'СК ООО',
    ogrn: '1122334455667',
    inn: '1122334455',
    kpp: '112233445',
    legalAddress: 'г. Екатеринбург, ул. Малышева, д. 50',
    actualAddress: 'г. Екатеринбург, ул. Малышева, д. 50',
    phone: '+7 (343) 345-67-89',
    email: 'info@skcom.ru',
    director: 'Павлов Павел Павлович',
    status: 'active',
    createdAt: '2025-03-01T00:00:00Z',
    members: [],
  },
  {
    id: 'company-004',
    name: 'ПРОМИЗДЕЛИЯ ООО',
    ogrn: '5544332211009',
    inn: '5544332211',
    kpp: '554433221',
    legalAddress: 'г. Казань, ул. Баумана, д. 25',
    actualAddress: 'г. Казань, ул. Баумана, д. 25',
    phone: '+7 (843) 456-78-90',
    email: 'info@promizdeliya.ru',
    director: 'Зайцев Илья Олегович',
    status: 'active',
    createdAt: '2025-01-20T00:00:00Z',
    members: [],
  },
  {
    id: 'company-005',
    name: 'РОСТ ООО',
    ogrn: '6677889900112',
    inn: '6677889900',
    kpp: '667788990',
    legalAddress: 'г. Новосибирск, пр. Ленина, д. 100',
    actualAddress: 'г. Новосибирск, пр. Ленина, д. 100',
    phone: '+7 (383) 567-89-01',
    email: 'info@rostcom.ru',
    director: 'Медведев Артем Константинович',
    status: 'pending',
    createdAt: '2025-04-01T00:00:00Z',
    members: [],
  },
]

export const getMockCompanyById = (id: string): Company | undefined => {
  return mockCompanies.find((c) => c.id === id)
}

export const getMockCompanyByName = (name: string): Company | undefined => {
  return mockCompanies.find(
    (c) => c.name.toLowerCase().includes(name.toLowerCase()),
  )
}

export const getMockCompaniesByStatus = (
  status: 'pending' | 'active' | 'rejected',
): Company[] => {
  return mockCompanies.filter((c) => c.status === status)
}
