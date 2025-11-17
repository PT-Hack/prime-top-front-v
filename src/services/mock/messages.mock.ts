import type { Chat, Message } from '@/types/message.types'
import { ChatType } from '@/types/message.types'
import { mockUsers } from './auth.mock'

export const mockChats: Chat[] = [
  {
    id: 'chat-001',
    type: ChatType.ORDER,
    participants: [mockUsers[2]!, mockUsers[4]!],
    lastMessage: {
      id: 'msg-005',
      chatId: 'chat-001',
      senderId: 'user-005',
      sender: mockUsers[4]!,
      text: 'Заказ подтвержден и отправлен в производство',
      createdAt: '2025-11-11T15:30:00Z',
      isRead: true,
    },
    unreadCount: 0,
    orderId: 'order-004',
  },
  {
    id: 'chat-002',
    type: ChatType.ORDER,
    participants: [mockUsers[2]!, mockUsers[9]!],
    lastMessage: {
      id: 'msg-010',
      chatId: 'chat-002',
      senderId: 'user-003',
      sender: mockUsers[2]!,
      text: 'Когда ожидается отгрузка?',
      createdAt: '2025-11-12T10:15:00Z',
      isRead: false,
    },
    unreadCount: 1,
    orderId: 'order-003',
  },
  {
    id: 'chat-003',
    type: ChatType.SUPPORT,
    participants: [mockUsers[1]!, mockUsers[4]!],
    lastMessage: {
      id: 'msg-015',
      chatId: 'chat-003',
      senderId: 'user-005',
      sender: mockUsers[4]!,
      text: 'Здравствуйте! Чем могу помочь?',
      createdAt: '2025-11-10T12:00:00Z',
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: 'chat-004',
    type: ChatType.COMPANY,
    participants: [mockUsers[2]!, mockUsers[3]!, mockUsers[6]!],
    lastMessage: {
      id: 'msg-020',
      chatId: 'chat-004',
      senderId: 'user-004',
      sender: mockUsers[3]!,
      text: 'Не забудьте оформить заказ на следующую неделю',
      createdAt: '2025-11-11T17:00:00Z',
      isRead: false,
    },
    unreadCount: 2,
    companyId: 'company-001',
  },
  {
    id: 'chat-005',
    type: ChatType.ORDER,
    participants: [mockUsers[6]!, mockUsers[9]!],
    lastMessage: {
      id: 'msg-025',
      chatId: 'chat-005',
      senderId: 'user-010',
      sender: mockUsers[9]!,
      text: 'Заказ готов к отгрузке',
      createdAt: '2025-11-12T08:00:00Z',
      isRead: false,
    },
    unreadCount: 1,
    orderId: 'order-005',
  },
]

export const mockMessages: Message[] = [
  {
    id: 'msg-001',
    chatId: 'chat-001',
    senderId: 'user-003',
    sender: mockUsers[2]!,
    text: 'Добрый день! Оформил новый заказ',
    createdAt: '2025-11-11T14:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-002',
    chatId: 'chat-001',
    senderId: 'user-005',
    sender: mockUsers[4]!,
    text: 'Здравствуйте! Принял заказ в обработку',
    createdAt: '2025-11-11T14:15:00Z',
    isRead: true,
  },
  {
    id: 'msg-003',
    chatId: 'chat-001',
    senderId: 'user-003',
    sender: mockUsers[2]!,
    text: 'Когда возможна отгрузка?',
    createdAt: '2025-11-11T14:30:00Z',
    isRead: true,
  },
  {
    id: 'msg-004',
    chatId: 'chat-001',
    senderId: 'user-005',
    sender: mockUsers[4]!,
    text: 'Планируемая дата отгрузки - 15 ноября',
    createdAt: '2025-11-11T15:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-005',
    chatId: 'chat-001',
    senderId: 'user-005',
    sender: mockUsers[4]!,
    text: 'Заказ подтвержден и отправлен в производство',
    createdAt: '2025-11-11T15:30:00Z',
    isRead: true,
  },
  {
    id: 'msg-006',
    chatId: 'chat-002',
    senderId: 'user-003',
    sender: mockUsers[2]!,
    text: 'Здравствуйте! По заказу №003',
    createdAt: '2025-11-10T11:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-007',
    chatId: 'chat-002',
    senderId: 'user-010',
    sender: mockUsers[9]!,
    text: 'Слушаю вас',
    createdAt: '2025-11-10T11:15:00Z',
    isRead: true,
  },
  {
    id: 'msg-008',
    chatId: 'chat-002',
    senderId: 'user-003',
    sender: mockUsers[2]!,
    text: 'Возможно ли ускорить производство?',
    createdAt: '2025-11-10T11:30:00Z',
    isRead: true,
  },
  {
    id: 'msg-009',
    chatId: 'chat-002',
    senderId: 'user-010',
    sender: mockUsers[9]!,
    text: 'Уточню у производства',
    createdAt: '2025-11-11T09:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-010',
    chatId: 'chat-002',
    senderId: 'user-003',
    sender: mockUsers[2]!,
    text: 'Когда ожидается отгрузка?',
    createdAt: '2025-11-12T10:15:00Z',
    isRead: false,
  },
  {
    id: 'msg-011',
    chatId: 'chat-003',
    senderId: 'user-002',
    sender: mockUsers[1]!,
    text: 'Добрый день! Хочу узнать о возможности создания компании',
    createdAt: '2025-11-10T11:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-012',
    chatId: 'chat-003',
    senderId: 'user-005',
    sender: mockUsers[4]!,
    text: 'Здравствуйте! Чем могу помочь?',
    createdAt: '2025-11-10T12:00:00Z',
    isRead: true,
  },
]

export const getMockChatById = (id: string): Chat | undefined => {
  return mockChats.find((c) => c.id === id)
}

export const getMockChatsByType = (type: ChatType): Chat[] => {
  return mockChats.filter((c) => c.type === type)
}

export const getMockChatsByUser = (userId: string): Chat[] => {
  return mockChats.filter((c) =>
    c.participants.some((p) => p.id === userId),
  )
}

export const getMockMessagesByChatId = (chatId: string): Message[] => {
  return mockMessages.filter((m) => m.chatId === chatId)
}
