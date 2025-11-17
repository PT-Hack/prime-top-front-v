import type { Order, OrderItem } from '@/types/order.types'
import { OrderStatus } from '@/types/order.types'
import { mockProducts } from './products.mock'

export const mockOrders: Order[] = [
  {
    id: 'order-001',
    companyId: 'company-002',
    companyName: 'ПКТ ООО',
    createdBy: 'user-008',
    createdByName: 'Орлов Андрей Сергеевич',
    assignedManager: 'user-005',
    assignedManagerName: 'Кузнецов Алексей Владимирович',
    status: OrderStatus.DELIVERED,
    items: [
      {
        id: 'item-001',
        productId: 'prod-007',
        product: mockProducts[6]!,
        quantity: 2000,
        price: 1200,
        isFromStock: true,
      },
      {
        id: 'item-002',
        productId: 'prod-008',
        product: mockProducts[7]!,
        quantity: 2000,
        price: 800,
        isFromStock: true,
      },
    ],
    total: 4000000,
    createdAt: '2025-05-10T10:00:00Z',
    updatedAt: '2025-05-15T16:00:00Z',
    notes: 'Заказ выполнен в срок',
  },
  {
    id: 'order-002',
    companyId: 'company-003',
    companyName: 'СК ООО',
    createdBy: 'user-011',
    createdByName: 'Менеджер СК ООО',
    assignedManager: 'user-005',
    assignedManagerName: 'Кузнецов Алексей Владимирович',
    status: OrderStatus.DELIVERED,
    items: [
      {
        id: 'item-003',
        productId: 'prod-013',
        product: mockProducts[12]!,
        quantity: 630,
        price: 780,
        isFromStock: true,
      },
      {
        id: 'item-004',
        productId: 'prod-014',
        product: mockProducts[13]!,
        quantity: 630,
        price: 780,
        isFromStock: true,
      },
    ],
    total: 983400,
    createdAt: '2025-09-10T09:00:00Z',
    updatedAt: '2025-09-12T14:00:00Z',
    notes: 'Отгружено',
  },
  {
    id: 'order-003',
    companyId: 'company-001',
    companyName: 'Тех ООО',
    createdBy: 'user-003',
    createdByName: 'Петров Петр Петрович',
    assignedManager: 'user-010',
    assignedManagerName: 'Морозов Владимир Павлович',
    status: OrderStatus.IN_PROGRESS,
    items: [
      {
        id: 'item-005',
        productId: 'prod-015',
        product: mockProducts[14]!,
        quantity: 1600,
        price: 780,
        isFromStock: true,
      },
    ],
    total: 1248000,
    createdAt: '2025-11-10T11:00:00Z',
    updatedAt: '2025-11-11T10:00:00Z',
    notes: 'В обработке',
  },
  {
    id: 'order-004',
    companyId: 'company-002',
    companyName: 'ПКТ ООО',
    createdBy: 'user-008',
    createdByName: 'Орлов Андрей Сергеевич',
    assignedManager: 'user-005',
    assignedManagerName: 'Кузнецов Алексей Владимирович',
    status: OrderStatus.CONFIRMED,
    items: [
      {
        id: 'item-006',
        productId: 'prod-007',
        product: mockProducts[6]!,
        quantity: 1000,
        price: 1200,
        isFromStock: true,
      },
      {
        id: 'item-007',
        productId: 'prod-008',
        product: mockProducts[7]!,
        quantity: 1000,
        price: 800,
        isFromStock: true,
      },
    ],
    total: 2000000,
    createdAt: '2025-11-11T14:00:00Z',
    updatedAt: '2025-11-11T15:30:00Z',
    notes: 'Подтвержден, готовится к отгрузке',
  },
  {
    id: 'order-005',
    companyId: 'company-001',
    companyName: 'Тех ООО',
    createdBy: 'user-007',
    createdByName: 'Волков Михаил Игоревич',
    status: OrderStatus.NEW,
    items: [
      {
        id: 'item-008',
        productId: 'prod-016',
        product: mockProducts[15]!,
        quantity: 5000,
        price: 780,
        isFromStock: true,
      },
      {
        id: 'item-009',
        productId: 'prod-017',
        product: mockProducts[16]!,
        quantity: 3000,
        price: 780,
        isFromStock: true,
      },
    ],
    total: 6240000,
    createdAt: '2025-11-12T09:00:00Z',
    updatedAt: '2025-11-12T09:00:00Z',
    notes: 'Новый заказ, ожидает обработки',
  },
  {
    id: 'order-006',
    companyId: 'company-003',
    companyName: 'СК ООО',
    createdBy: 'user-011',
    createdByName: 'Менеджер СК ООО',
    assignedManager: 'user-010',
    assignedManagerName: 'Морозов Владимир Павлович',
    status: OrderStatus.PENDING,
    items: [
      {
        id: 'item-010',
        productId: 'prod-019',
        product: mockProducts[18]!,
        quantity: 2000,
        price: 820,
        isFromStock: true,
      },
      {
        id: 'item-011',
        productId: 'prod-020',
        product: mockProducts[19]!,
        quantity: 1500,
        price: 820,
        isFromStock: true,
      },
    ],
    total: 2870000,
    createdAt: '2025-11-11T16:00:00Z',
    updatedAt: '2025-11-12T08:00:00Z',
    notes: 'Ожидает подтверждения от производства',
  },
  {
    id: 'order-007',
    companyId: 'company-002',
    companyName: 'ПКТ ООО',
    createdBy: 'user-009',
    createdByName: 'Лебедев Николай Викторович',
    assignedManager: 'user-005',
    assignedManagerName: 'Кузнецов Алексей Владимирович',
    status: OrderStatus.CANCELLED,
    items: [
      {
        id: 'item-012',
        productId: 'prod-018',
        product: mockProducts[17]!,
        quantity: 1000,
        price: 780,
        isFromStock: false,
      },
    ],
    total: 780000,
    createdAt: '2025-10-15T10:00:00Z',
    updatedAt: '2025-10-16T12:00:00Z',
    notes: 'Отменен по запросу клиента',
  },
]

export const getMockOrderById = (id: string): Order | undefined => {
  return mockOrders.find((o) => o.id === id)
}

export const getMockOrdersByCompany = (companyId: string): Order[] => {
  return mockOrders.filter((o) => o.companyId === companyId)
}

export const getMockOrdersByStatus = (status: OrderStatus): Order[] => {
  return mockOrders.filter((o) => o.status === status)
}

export const getMockOrdersByManager = (managerId: string): Order[] => {
  return mockOrders.filter((o) => o.assignedManager === managerId)
}
