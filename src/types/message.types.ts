import type { User } from './auth.types'

export enum ChatType {
  SUPPORT = 'support',
  ORDER = 'order',
  COMPANY = 'company',
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  sender: User
  text: string
  attachments?: string[]
  createdAt: string
  isRead: boolean
}

export interface Chat {
  id: string
  type: ChatType
  participants: User[]
  lastMessage?: Message
  unreadCount: number
  orderId?: string
  companyId?: string
}

export interface MessagesState {
  chats: Chat[]
  currentChat: Chat | null
  messages: Message[]
  loading: boolean
}
