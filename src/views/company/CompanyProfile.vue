<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Company } from '@/types/company.types'
import type { User } from '@/types/auth.types'
import type { Invitation } from '@/types/invitation.types'
import { UserRole } from '@/types/auth.types'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { companiesApi } from '@/services/api/companies.api'
import { invitationsApi } from '@/services/api/invitations.api'
import { usersApi } from '@/services/api/users.api'
import { formatters } from '@/utils/formatters'
import MainLayout from '@/components/layout/MainLayout.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppLoader from '@/components/common/AppLoader.vue'

const router = useRouter()
const { currentUser } = useAuth()
const { showToast } = useToast()

const loading = ref(false)
const company = ref<Company | null>(null)
const editingCompany = ref(false)
const removingMember = ref<string | null>(null)

// Приглашения
const showInviteModal = ref(false)
const invitations = ref<Invitation[]>([])
const allUsers = ref<User[]>([])
const selectedUserId = ref('')
const invitationMessage = ref('')
const sendingInvitation = ref(false)
const cancellingInvitation = ref<string | null>(null)

// Форма редактирования компании
const companyForm = ref({
  title: '',
  OGRN: '',
  INN: '',
  KPP: '',
  address: '',
  phone: '',
  email: '',
  checking_account: '',
  bank_name: '',
  BIK: '',
  correspondent_account: '',
})

// Проверка прав
const isCompanyAdmin = computed(() => {
  return currentUser.value?.role?.title === UserRole.CLIENT_ADMIN
})

// Получить метку роли на русском
const getRoleLabel = (roleTitle: string): string => {
  const labels: Record<string, string> = {
    'system-admin': 'Администратор системы',
    'system-manager': 'Менеджер системы',
    'client-admin': 'Клиент-админ',
    'client-manager': 'Клиент-менеджер',
  }
  return labels[roleTitle] || roleTitle
}

// Получить цвет бейджа роли
const getRoleBadgeColor = (roleTitle: string): string => {
  const colors: Record<string, string> = {
    'system-admin': 'bg-red-100 text-red-800',
    'system-manager': 'bg-orange-100 text-orange-800',
    'client-admin': 'bg-purple-100 text-purple-800',
    'client-manager': 'bg-green-100 text-green-800',
  }
  return colors[roleTitle] || 'bg-gray-100 text-gray-800'
}

// Загрузка компании
const loadCompany = async () => {
  if (!currentUser.value?.company_id) {
    showToast('Вы не состоите в компании', 'warning')
    router.push('/profile')
    return
  }

  loading.value = true

  try {
    company.value = await companiesApi.getCompanyById(currentUser.value.company_id)

    if (!company.value) {
      showToast('Компания не найдена', 'error')
      router.push('/profile')
    } else {
      // Заполняем форму данными компании
      companyForm.value = {
        title: company.value.title,
        OGRN: company.value.OGRN,
        INN: company.value.INN,
        KPP: company.value.KPP,
        address: company.value.address,
        phone: company.value.phone,
        email: company.value.email,
        checking_account: company.value.checking_account,
        bank_name: company.value.bank_name,
        BIK: company.value.BIK,
        correspondent_account: company.value.correspondent_account,
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки компании:', error)
    showToast('Ошибка загрузки компании', 'error')
  } finally {
    loading.value = false
  }
}

// Сохранить изменения компании
const handleSaveCompany = async () => {
  if (!company.value) return

  editingCompany.value = true

  try {
    company.value = await companiesApi.updateCompany(company.value.id, companyForm.value)
    showToast('Информация о компании обновлена', 'success')
  } catch (error: any) {
    console.error('Ошибка обновления компании:', error)
    showToast(error.message || 'Ошибка обновления компании', 'error')
  } finally {
    editingCompany.value = false
  }
}

// Удалить участника - функция недоступна в текущем API
const handleRemoveMember = async (userId: string) => {
  showToast('Функция удаления участника будет доступна в следующей версии', 'info')
}

// Изменить роль участника - функция недоступна в текущем API
const handleChangeRole = async (userId: string, newRole: UserRole) => {
  showToast('Функция изменения роли будет доступна в следующей версии', 'info')
}

// Открыть чат с участником (placeholder)
const handleOpenChat = (userId: string) => {
  showToast('Функция чата будет доступна в следующей версии', 'info')
  // В Stage 12 будет: router.push(`/messages?userId=${userId}`)
}

// Пользователи, доступные для приглашения
const availableUsers = computed(() => {
  if (!company.value) return []

  const memberIds = new Set((company.value.users || []).map((u) => u.id))
  const invitedUserIds = new Set(
    invitations.value.filter((inv) => inv.status === 'pending').map((inv) => inv.user_id),
  )

  return allUsers.value.filter(
    (user) =>
      !memberIds.has(user.id) && // Не является участником
      !invitedUserIds.has(user.id) && // Нет активного приглашения
      !user.company_id && // Не состоит в другой компании
      user.id !== currentUser.value?.id, // Не сам пользователь
  )
})

// Загрузить приглашения и пользователей
const loadInvitationsAndUsers = async () => {
  if (!company.value || !isCompanyAdmin.value) return

  try {
    const [invs, users] = await Promise.all([
      invitationsApi.getUserInvitations(),
      usersApi.getUsers(),
    ])

    invitations.value = invs.filter((inv) => inv.status === 'pending' && inv.company_id === company.value!.id)
    allUsers.value = users
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
  }
}

// Открыть модал приглашения
const handleOpenInviteModal = async () => {
  await loadInvitationsAndUsers()
  showInviteModal.value = true
}

// Отправить приглашение
const handleSendInvitation = async () => {
  if (!company.value || !currentUser.value || !selectedUserId.value) return

  sendingInvitation.value = true

  try {
    await invitationsApi.createInvitation({
      company_id: company.value.id,
      user_id: selectedUserId.value,
    })

    showToast('Приглашение отправлено', 'success')
    selectedUserId.value = ''
    invitationMessage.value = ''
    showInviteModal.value = false

    // Перезагружаем приглашения
    await loadInvitationsAndUsers()
  } catch (error: any) {
    console.error('Ошибка отправки приглашения:', error)
    showToast(error.message || 'Ошибка отправки приглашения', 'error')
  } finally {
    sendingInvitation.value = false
  }
}

// Отменить приглашение
const handleCancelInvitation = async (invitationId: string) => {
  if (!currentUser.value) return

  if (!confirm('Отменить приглашение?')) return

  cancellingInvitation.value = invitationId

  try {
    await invitationsApi.updateInvitation(invitationId, { status: 'canceled' })
    showToast('Приглашение отменено', 'success')

    // Удаляем из списка
    invitations.value = invitations.value.filter((inv) => inv.id !== invitationId)
  } catch (error: any) {
    console.error('Ошибка отмены приглашения:', error)
    showToast(error.message || 'Ошибка отмены приглашения', 'error')
  } finally {
    cancellingInvitation.value = null
  }
}

// Форматирование даты
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

onMounted(() => {
  loadCompany()
})
</script>

<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-6">
      <!-- Заголовок -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-text">Профиль компании</h1>
        <p class="text-gray-600 mt-1">Информация о компании и участниках</p>
      </div>

      <!-- Загрузка -->
      <AppLoader v-if="loading" class="py-12" />

      <!-- Контент -->
      <div v-else-if="company" class="space-y-6">
        <!-- Информация о компании -->
        <AppCard>
          <div class="flex items-start justify-between mb-4">
            <h2 class="text-2xl font-semibold text-text">{{ company.title }}</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div class="text-gray-500 mb-1">ОГРН</div>
              <div v-if="!isCompanyAdmin" class="font-medium text-text">{{ company.OGRN }}</div>
              <input
                v-else
                v-model="companyForm.OGRN"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <div class="text-gray-500 mb-1">ИНН</div>
              <div v-if="!isCompanyAdmin" class="font-medium text-text">{{ company.INN }}</div>
              <input
                v-else
                v-model="companyForm.INN"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <div class="text-gray-500 mb-1">КПП</div>
              <div v-if="!isCompanyAdmin" class="font-medium text-text">{{ company.KPP }}</div>
              <input
                v-else
                v-model="companyForm.KPP"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <div class="text-gray-500 mb-1">Телефон</div>
              <div v-if="!isCompanyAdmin" class="font-medium text-text">{{ company.phone }}</div>
              <input
                v-else
                v-model="companyForm.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <div class="text-gray-500 mb-1">Email</div>
              <div v-if="!isCompanyAdmin" class="font-medium text-text">{{ company.email }}</div>
              <input
                v-else
                v-model="companyForm.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div class="md:col-span-2">
              <div class="text-gray-500 mb-1">Адрес</div>
              <div v-if="!isCompanyAdmin" class="font-medium text-text">
                {{ company.address }}
              </div>
              <input
                v-else
                v-model="companyForm.address"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <div class="text-gray-500 mb-1">Расчетный счет</div>
              <div v-if="!isCompanyAdmin" class="font-medium text-text">{{ company.checking_account }}</div>
              <input
                v-else
                v-model="companyForm.checking_account"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <div class="text-gray-500 mb-1">Название банка</div>
              <div v-if="!isCompanyAdmin" class="font-medium text-text">{{ company.bank_name }}</div>
              <input
                v-else
                v-model="companyForm.bank_name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <div class="text-gray-500 mb-1">БИК</div>
              <div v-if="!isCompanyAdmin" class="font-medium text-text">{{ company.BIK }}</div>
              <input
                v-else
                v-model="companyForm.BIK"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <div class="text-gray-500 mb-1">Корреспондентский счет</div>
              <div v-if="!isCompanyAdmin" class="font-medium text-text">{{ company.correspondent_account }}</div>
              <input
                v-else
                v-model="companyForm.correspondent_account"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div v-if="isCompanyAdmin" class="mt-6 flex justify-end">
            <AppButton
              variant="primary"
              :loading="editingCompany"
              @click="handleSaveCompany"
            >
              Сохранить изменения
            </AppButton>
          </div>
        </AppCard>

        <!-- Участники компании -->
        <AppCard>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-text">
              Участники ({{ company.users?.length || 0 }})
            </h2>
            <AppButton
              v-if="isCompanyAdmin"
              variant="primary"
              size="sm"
              @click="handleOpenInviteModal"
            >
              Пригласить пользователя
            </AppButton>
          </div>

          <div v-if="company.users && company.users.length > 0" class="space-y-3">
            <div
              v-for="user in company.users"
              :key="user.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="font-semibold text-text">{{ formatters.fullName(user) }}</h3>
                  <span
                    v-if="user.role"
                    :class="['px-2 py-1 rounded text-xs font-medium', getRoleBadgeColor(user.role.title)]"
                  >
                    {{ getRoleLabel(user.role.title) }}
                  </span>
                </div>

                <div class="text-sm text-gray-600">
                  <div>Email: {{ user.email }}</div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <AppButton variant="outline" size="sm" @click="handleOpenChat(user.id)">
                  Написать
                </AppButton>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            В компании пока нет участников
          </div>
        </AppCard>

        <!-- Отправленные приглашения -->
        <AppCard v-if="isCompanyAdmin && invitations.length > 0">
          <div class="mb-4">
            <h2 class="text-xl font-semibold text-text">
              Отправленные приглашения ({{ invitations.length }})
            </h2>
          </div>

          <div class="space-y-3">
            <div
              v-for="invitation in invitations"
              :key="invitation.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex-1">
                <h3 class="font-semibold text-text mb-1">
                  {{ invitation.user ? formatters.fullName(invitation.user) : `Пользователь #${invitation.user_id}` }}
                </h3>
                <div class="text-sm text-gray-600">
                  <div v-if="invitation.user">Email: {{ invitation.user.email }}</div>
                  <div>ID пользователя: {{ invitation.user_id }}</div>
                </div>
              </div>

              <AppButton
                variant="danger"
                size="sm"
                :loading="cancellingInvitation === invitation.id"
                @click="handleCancelInvitation(invitation.id)"
              >
                Отменить
              </AppButton>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Компания не найдена -->
      <AppCard v-else class="text-center py-12">
        <p class="text-lg text-gray-600 mb-4">Компания не найдена</p>
        <AppButton variant="primary" @click="router.push('/profile')">
          Перейти в профиль
        </AppButton>
      </AppCard>
    </div>

    <!-- Модал приглашения пользователя -->
    <div
      v-if="showInviteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showInviteModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <h3 class="text-xl font-semibold text-text mb-4">Пригласить пользователя</h3>

          <div class="space-y-4">
            <!-- Выбор пользователя -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Пользователь
              </label>
              <select
                v-model="selectedUserId"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Выберите пользователя</option>
                <option
                  v-for="user in availableUsers"
                  :key="user.id"
                  :value="user.id"
                >
                  {{ formatters.fullName(user) }} ({{ user.email }})
                </option>
              </select>
            </div>

            <!-- Сообщение -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Сообщение (опционально)
              </label>
              <textarea
                v-model="invitationMessage"
                rows="3"
                placeholder="Добавьте сообщение к приглашению..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              ></textarea>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <AppButton
              variant="outline"
              @click="showInviteModal = false"
              :disabled="sendingInvitation"
            >
              Отмена
            </AppButton>
            <AppButton
              variant="primary"
              :loading="sendingInvitation"
              :disabled="!selectedUserId"
              @click="handleSendInvitation"
            >
              Отправить приглашение
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
