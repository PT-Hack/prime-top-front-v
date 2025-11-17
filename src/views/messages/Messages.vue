<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Chat, Message } from '@/types/message.types'
import { ChatType } from '@/types/message.types'
import type { Invitation } from '@/types/invitation.types'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { messagesApi } from '@/services/api/messages.api'
import { invitationsApi } from '@/services/api/invitations.api'
import MainLayout from '@/components/layout/MainLayout.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppLoader from '@/components/common/AppLoader.vue'

const route = useRoute()
const router = useRouter()
const { currentUser } = useAuth()
const { showToast } = useToast()

const loading = ref(false)
const chats = ref<Chat[]>([])
const currentChat = ref<Chat | null>(null)
const messages = ref<Message[]>([])
const messageText = ref('')
const sendingMessage = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

// Приглашения
const viewMode = ref<'chats' | 'invitations'>('chats')
const invitations = ref<Invitation[]>([])
const currentInvitation = ref<Invitation | null>(null)
const processingInvitation = ref<string | null>(null)

// Фильтр по типу чата
const chatTypeFilter = ref<ChatType | 'all'>('all')

// Получить название типа чата на русском
const getChatTypeLabel = (type: ChatType): string => {
  const labels: Record<ChatType, string> = {
    support: 'Поддержка',
    order: 'По заказу',
    company: 'Компания',
  }
  return labels[type] || type
}

// Получить цвет бейджа типа чата
const getChatTypeBadgeColor = (type: ChatType): string => {
  const colors: Record<ChatType, string> = {
    support: 'bg-blue-100 text-blue-800',
    order: 'bg-green-100 text-green-800',
    company: 'bg-purple-100 text-purple-800',
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

// Отфильтрованные чаты
const filteredChats = computed(() => {
  if (chatTypeFilter.value === 'all') {
    return chats.value
  }
  return chats.value.filter((chat) => chat.type === chatTypeFilter.value)
})

// Получить имя чата
const getChatName = (chat: Chat): string => {
  if (!currentUser.value) return 'Чат'

  const otherParticipants = chat.participants.filter((p) => p.id !== currentUser.value!.id)

  if (chat.type === 'support') {
    return 'Поддержка'
  } else if (chat.type === 'order' && chat.orderId) {
    return `Заказ №${chat.orderId}`
  } else if (chat.type === 'company') {
    if (otherParticipants.length > 0) {
      return otherParticipants.map((p) => p.fullName).join(', ')
    }
    return 'Чат компании'
  }

  if (otherParticipants.length > 0) {
    return otherParticipants.map((p) => p.fullName).join(', ')
  }

  return 'Чат'
}

// Форматирование даты
const formatMessageDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = diffInMs / (1000 * 60 * 60)

  if (diffInHours < 24) {
    // Сегодня - показываем время
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } else if (diffInHours < 48) {
    // Вчера
    return 'Вчера'
  } else {
    // Дата
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
    }).format(date)
  }
}

const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Загрузка чатов
const loadChats = async () => {
  if (!currentUser.value) return

  loading.value = true

  try {
    chats.value = await messagesApi.getChats(currentUser.value.id)

    // Если есть chatId в query, открываем этот чат
    const chatId = route.query.chatId as string
    if (chatId) {
      const chat = chats.value.find((c) => c.id === chatId)
      if (chat) {
        await selectChat(chat)
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки чатов:', error)
    showToast('Ошибка загрузки чатов', 'error')
  } finally {
    loading.value = false
  }
}

// Выбор чата
const selectChat = async (chat: Chat) => {
  currentChat.value = chat
  await loadMessages(chat.id)
}

// Загрузка сообщений
const loadMessages = async (chatId: string) => {
  try {
    messages.value = await messagesApi.getMessages(chatId)

    // Прокручиваем к последнему сообщению
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Ошибка загрузки сообщений:', error)
    showToast('Ошибка загрузки сообщений', 'error')
  }
}

// Отправка сообщения
const handleSendMessage = async () => {
  if (!currentChat.value || !currentUser.value || !messageText.value.trim()) return

  sendingMessage.value = true

  try {
    const newMessage = await messagesApi.sendMessage(
      currentChat.value.id,
      messageText.value.trim(),
      currentUser.value.id
    )

    // Добавляем сообщение в список
    messages.value.push({
      ...newMessage,
      sender: currentUser.value,
    })

    messageText.value = ''

    // Прокручиваем к последнему сообщению
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error)
    showToast('Ошибка отправки сообщения', 'error')
  } finally {
    sendingMessage.value = false
  }
}

// Прокрутка к последнему сообщению
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Обработка Enter для отправки
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSendMessage()
  }
}

// Загрузка приглашений
const loadInvitations = async () => {
  if (!currentUser.value) return

  loading.value = true

  try {
    invitations.value = await invitationsApi.getUserInvitations(currentUser.value.id)
  } catch (error) {
    console.error('Ошибка загрузки приглашений:', error)
    showToast('Ошибка загрузки приглашений', 'error')
  } finally {
    loading.value = false
  }
}

// Выбрать приглашение
const selectInvitation = (invitation: Invitation) => {
  currentInvitation.value = invitation
}

// Принять приглашение
const handleAcceptInvitation = async (invitationId: string) => {
  if (!currentUser.value) return

  processingInvitation.value = invitationId

  try {
    await invitationsApi.acceptInvitation(invitationId, currentUser.value.id)
    showToast('Приглашение принято! Добро пожаловать в компанию.', 'success')

    // Удаляем принятое приглашение и все остальные из списка
    invitations.value = []
    currentInvitation.value = null

    // Перезагружаем страницу для обновления роли пользователя
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error: any) {
    console.error('Ошибка принятия приглашения:', error)
    showToast(error.message || 'Ошибка принятия приглашения', 'error')
  } finally {
    processingInvitation.value = null
  }
}

// Отклонить приглашение
const handleRejectInvitation = async (invitationId: string) => {
  if (!currentUser.value) return

  if (!confirm('Отклонить приглашение?')) return

  processingInvitation.value = invitationId

  try {
    await invitationsApi.rejectInvitation(invitationId, currentUser.value.id)
    showToast('Приглашение отклонено', 'success')

    // Удаляем из списка
    invitations.value = invitations.value.filter((inv) => inv.id !== invitationId)
    if (currentInvitation.value?.id === invitationId) {
      currentInvitation.value = null
    }
  } catch (error: any) {
    console.error('Ошибка отклонения приглашения:', error)
    showToast(error.message || 'Ошибка отклонения приглашения', 'error')
  } finally {
    processingInvitation.value = null
  }
}

// Переключение режима просмотра
const switchToChats = () => {
  viewMode.value = 'chats'
  currentInvitation.value = null
  if (chats.value.length === 0) {
    loadChats()
  }
}

const switchToInvitations = () => {
  viewMode.value = 'invitations'
  currentChat.value = null
  loadInvitations()
}

// Форматирование даты для приглашений
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

onMounted(() => {
  loadChats()
})
</script>

<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-6">
      <!-- Заголовок -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-text">Сообщения</h1>
            <p class="text-gray-600 mt-1">Ваши чаты и переписка</p>
          </div>
          <div class="flex gap-2">
            <AppButton
              :variant="viewMode === 'chats' ? 'primary' : 'outline'"
              @click="switchToChats"
            >
              Чаты
            </AppButton>
            <AppButton
              :variant="viewMode === 'invitations' ? 'primary' : 'outline'"
              @click="switchToInvitations"
            >
              Приглашения
              <span
                v-if="invitations.length > 0 && viewMode === 'chats'"
                class="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-medium"
              >
                {{ invitations.length }}
              </span>
            </AppButton>
          </div>
        </div>
      </div>

      <!-- Загрузка -->
      <AppLoader v-if="loading" class="py-12" />

      <!-- Интерфейс сообщений -->
      <div v-else-if="viewMode === 'chats'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
        <!-- Список чатов -->
        <AppCard class="lg:col-span-1 flex flex-col">
          <!-- Фильтры -->
          <div class="mb-4">
            <div class="flex gap-2 flex-wrap">
              <button
                @click="chatTypeFilter = 'all'"
                :class="[
                  'px-3 py-1 rounded-lg text-sm font-medium transition-colors border-2',
                  chatTypeFilter === 'all'
                    ? 'bg-[#054787] text-white border-[#054787]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#054787] hover:bg-gray-50',
                ]"
              >
                Все
              </button>
              <button
                @click="chatTypeFilter = ChatType.SUPPORT"
                :class="[
                  'px-3 py-1 rounded-lg text-sm font-medium transition-colors border-2',
                  chatTypeFilter === ChatType.SUPPORT
                    ? 'bg-[#054787] text-white border-[#054787]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#054787] hover:bg-gray-50',
                ]"
              >
                Поддержка
              </button>
              <button
                @click="chatTypeFilter = ChatType.ORDER"
                :class="[
                  'px-3 py-1 rounded-lg text-sm font-medium transition-colors border-2',
                  chatTypeFilter === ChatType.ORDER
                    ? 'bg-[#054787] text-white border-[#054787]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#054787] hover:bg-gray-50',
                ]"
              >
                Заказы
              </button>
              <button
                @click="chatTypeFilter = ChatType.COMPANY"
                :class="[
                  'px-3 py-1 rounded-lg text-sm font-medium transition-colors border-2',
                  chatTypeFilter === ChatType.COMPANY
                    ? 'bg-[#054787] text-white border-[#054787]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#054787] hover:bg-gray-50',
                ]"
              >
                Компания
              </button>
            </div>
          </div>

          <!-- Список -->
          <div class="flex-1 overflow-y-auto space-y-2">
            <div
              v-for="chat in filteredChats"
              :key="chat.id"
              @click="selectChat(chat)"
              :class="[
                'p-3 rounded-lg cursor-pointer transition-colors',
                currentChat?.id === chat.id
                  ? 'bg-primary-50 border-2 border-primary'
                  : 'bg-gray-50 hover:bg-gray-100',
              ]"
            >
              <div class="flex items-start justify-between mb-1">
                <div class="font-semibold text-text text-sm truncate flex-1">
                  {{ getChatName(chat) }}
                </div>
                <span
                  v-if="chat.unreadCount > 0"
                  class="ml-2 px-2 py-0.5 bg-primary text-white rounded-full text-xs font-medium flex-shrink-0"
                >
                  {{ chat.unreadCount }}
                </span>
              </div>

              <div class="flex items-center gap-2 mb-1">
                <span :class="['px-2 py-0.5 rounded text-xs', getChatTypeBadgeColor(chat.type)]">
                  {{ getChatTypeLabel(chat.type) }}
                </span>
                <span v-if="chat.lastMessage" class="text-xs text-gray-500">
                  {{ formatMessageDate(chat.lastMessage.createdAt) }}
                </span>
              </div>

              <div v-if="chat.lastMessage" class="text-xs text-gray-600 truncate">
                {{ chat.lastMessage.text }}
              </div>
            </div>

            <!-- Пустое состояние -->
            <div v-if="filteredChats.length === 0" class="text-center py-8 text-gray-500">
              <p>Нет чатов</p>
            </div>
          </div>
        </AppCard>

        <!-- Окно чата -->
        <AppCard class="lg:col-span-2 flex flex-col">
          <!-- Выбран чат -->
          <div v-if="currentChat" class="flex flex-col h-full">
            <!-- Заголовок чата -->
            <div class="pb-4 border-b border-gray-200 mb-4">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-semibold text-text">{{ getChatName(currentChat) }}</h2>
                  <span :class="['px-2 py-1 rounded text-xs mt-1 inline-block', getChatTypeBadgeColor(currentChat.type)]">
                    {{ getChatTypeLabel(currentChat.type) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Список сообщений -->
            <div ref="messagesContainer" class="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
              <div
                v-for="message in messages"
                :key="message.id"
                :class="[
                  'flex',
                  message.senderId === currentUser?.id ? 'justify-end' : 'justify-start',
                ]"
              >
                <div
                  :class="[
                    'max-w-[70%] rounded-lg p-3',
                    message.senderId === currentUser?.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-text',
                  ]"
                >
                  <div
                    v-if="message.senderId !== currentUser?.id"
                    class="text-xs font-semibold mb-1 opacity-70"
                  >
                    {{ message.sender?.fullName || 'Пользователь' }}
                  </div>
                  <div class="text-sm break-words whitespace-pre-wrap">{{ message.text }}</div>
                  <div
                    :class="[
                      'text-xs mt-1',
                      message.senderId === currentUser?.id
                        ? 'text-white opacity-70'
                        : 'text-gray-500',
                    ]"
                  >
                    {{ formatMessageTime(message.createdAt) }}
                  </div>
                </div>
              </div>

              <!-- Пустое состояние -->
              <div v-if="messages.length === 0" class="text-center py-12 text-gray-500">
                <p>Нет сообщений</p>
                <p class="text-sm mt-2">Начните переписку</p>
              </div>
            </div>

            <!-- Форма отправки -->
            <div class="border-t border-gray-200 pt-4">
              <div class="flex gap-2">
                <textarea
                  v-model="messageText"
                  @keydown="handleKeydown"
                  placeholder="Введите сообщение..."
                  rows="2"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                ></textarea>
                <AppButton
                  variant="primary"
                  :disabled="!messageText.trim() || sendingMessage"
                  :loading="sendingMessage"
                  @click="handleSendMessage"
                  class="self-end"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </AppButton>
              </div>
              <div class="text-xs text-gray-500 mt-2">
                Нажмите Enter для отправки, Shift+Enter для новой строки
              </div>
            </div>
          </div>

          <!-- Чат не выбран -->
          <div v-else class="flex items-center justify-center h-full text-gray-400">
            <div class="text-center">
              <svg
                class="mx-auto h-16 w-16 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p class="text-lg">Выберите чат для начала переписки</p>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Интерфейс приглашений -->
      <div v-else-if="viewMode === 'invitations'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
        <!-- Список приглашений -->
        <AppCard class="lg:col-span-1 flex flex-col">
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-text">Приглашения в компании</h3>
            <p class="text-xs text-gray-500 mt-1">{{ invitations.length }} активных</p>
          </div>

          <!-- Список -->
          <div class="flex-1 overflow-y-auto space-y-2">
            <div
              v-for="invitation in invitations"
              :key="invitation.id"
              @click="selectInvitation(invitation)"
              :class="[
                'p-3 rounded-lg cursor-pointer transition-colors',
                currentInvitation?.id === invitation.id
                  ? 'bg-primary-50 border-2 border-primary'
                  : 'bg-gray-50 hover:bg-gray-100',
              ]"
            >
              <div class="font-semibold text-text text-sm mb-1">
                {{ invitation.company.name }}
              </div>
              <div class="text-xs text-gray-600">
                От: {{ invitation.invitedByUser.fullName }}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                {{ formatDate(invitation.createdAt) }}
              </div>
            </div>

            <!-- Пустое состояние -->
            <div v-if="invitations.length === 0" class="text-center py-8 text-gray-500">
              <p>Нет приглашений</p>
            </div>
          </div>
        </AppCard>

        <!-- Детали приглашения -->
        <AppCard class="lg:col-span-2 flex flex-col">
          <!-- Выбрано приглашение -->
          <div v-if="currentInvitation" class="flex flex-col h-full">
            <div class="flex-1">
              <h2 class="text-2xl font-semibold text-text mb-4">
                Приглашение в компанию
              </h2>

              <div class="space-y-4">
                <!-- Информация о компании -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h3 class="font-semibold text-text mb-3">Компания</h3>
                  <div class="space-y-2 text-sm">
                    <div>
                      <span class="text-gray-500">Название:</span>
                      <span class="ml-2 font-medium">{{ currentInvitation.company.name }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">ИНН:</span>
                      <span class="ml-2">{{ currentInvitation.company.inn }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Телефон:</span>
                      <span class="ml-2">{{ currentInvitation.company.phone }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Email:</span>
                      <span class="ml-2">{{ currentInvitation.company.email }}</span>
                    </div>
                  </div>
                </div>

                <!-- Кто пригласил -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h3 class="font-semibold text-text mb-3">Отправитель</h3>
                  <div class="space-y-2 text-sm">
                    <div>
                      <span class="text-gray-500">Имя:</span>
                      <span class="ml-2 font-medium">{{ currentInvitation.invitedByUser.fullName }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Email:</span>
                      <span class="ml-2">{{ currentInvitation.invitedByUser.email }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Дата отправки:</span>
                      <span class="ml-2">{{ formatDate(currentInvitation.createdAt) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Сообщение -->
                <div v-if="currentInvitation.message" class="bg-blue-50 p-4 rounded-lg">
                  <h3 class="font-semibold text-text mb-2">Сообщение</h3>
                  <p class="text-sm text-gray-700 italic">{{ currentInvitation.message }}</p>
                </div>

                <!-- Предупреждение -->
                <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p class="text-sm text-yellow-800">
                    <strong>Внимание:</strong> Приняв приглашение, вы присоединитесь к этой компании.
                    Вы можете состоять только в одной компании. Все остальные приглашения будут автоматически отклонены.
                  </p>
                </div>
              </div>
            </div>

            <!-- Кнопки действий -->
            <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
              <AppButton
                variant="outline"
                :loading="processingInvitation === currentInvitation.id"
                @click="handleRejectInvitation(currentInvitation.id)"
              >
                Отклонить
              </AppButton>
              <AppButton
                variant="primary"
                :loading="processingInvitation === currentInvitation.id"
                @click="handleAcceptInvitation(currentInvitation.id)"
              >
                Принять приглашение
              </AppButton>
            </div>
          </div>

          <!-- Приглашение не выбрано -->
          <div v-else class="flex items-center justify-center h-full text-gray-400">
            <div class="text-center">
              <svg
                class="mx-auto h-16 w-16 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                />
              </svg>
              <p class="text-lg">Выберите приглашение для просмотра</p>
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  </MainLayout>
</template>
