import type { Chat, Message } from '@/types/message.types'
import { mockChats, mockMessages } from '@/services/mock/messages.mock'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const messagesApi = {
  async getChats(userId: string): Promise<Chat[]> {
    await delay()
    return mockChats.filter(c =>
      c.participants.some(p => p.id === userId)
    )
  },

  async getChatById(id: string): Promise<Chat | null> {
    await delay()
    return mockChats.find(c => c.id === id) || null
  },

  async getMessages(chatId: string): Promise<Message[]> {
    await delay()
    return mockMessages.filter(m => m.chatId === chatId)
  },

  async sendMessage(chatId: string, text: string, senderId: string): Promise<Message> {
    await delay()
    const newMessage: Message = {
      id: 'msg-' + Date.now(),
      chatId,
      senderId,
      sender: {} as any,
      text,
      createdAt: new Date().toISOString(),
      isRead: false,
    }
    mockMessages.push(newMessage)
    return newMessage
  },
}
