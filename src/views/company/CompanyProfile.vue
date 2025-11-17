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
  name: '',
  ogrn: '',
  inn: '',
  kpp: '',
  legalAddress: '',
  actualAddress: '',
  phone: '',
  email: '',
  director: '',
})

// Проверка прав
const isCompanyAdmin = computed(() => {
  return currentUser.value?.role === UserRole.COMPANY_ADMIN
})

// Получить метку роли на русском
const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    guest: 'Гость',
    user: 'Пользователь',
    company_manager: 'Менеджер компании',
    company_admin: 'Админ компании',
    system_manager: 'Менеджер системы',
    system_admin: 'Админ системы',
  }
  return labels[role] || role
}

// Получить цвет бейджа роли
const getRoleBadgeColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    guest: 'bg-gray-100 text-gray-800',
    user: 'bg-blue-100 text-blue-800',
    company_manager: 'bg-green-100 text-green-800',
    company_admin: 'bg-purple-100 text-purple-800',
    system_manager: 'bg-orange-100 text-orange-800',
    system_admin: 'bg-red-100 text-red-800',
  }
  return colors[role] || 'bg-gray-100 text-gray-800'
}

// Загрузка компании
const loadCompany = async () => {
  if (!currentUser.value?.companyId) {
    showToast('Вы не состоите в компании', 'warning')
    router.push('/profile')
    return
  }

  loading.value = true

  try {
    company.value = await companiesApi.getCompanyById(currentUser.value.companyId)

    if (!company.value) {
      showToast('Компания не найдена', 'error')
      router.push('/profile')
    } else {
      // Заполняем форму данными компании
      companyForm.value = {
        name: company.value.name,
        ogrn: company.value.ogrn,
        inn: company.value.inn,
        kpp: company.value.kpp,
        legalAddress: company.value.legalAddress,
        actualAddress: company.value.actualAddress,
        phone: company.value.phone,
        email: company.value.email,
        director: company.value.director,
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

// Удалить участника
const handleRemoveMember = async (userId: string) => {
  if (!company.value) return

  if (!confirm('Вы уверены, что хотите удалить участника из компании?')) return

  removingMember.value = userId

  try {
    company.value = await companiesApi.removeMember(company.value.id, userId)
    showToast('Участник удалён из компании', 'success')
  } catch (error: any) {
    console.error('Ошибка удаления участника:', error)
    showToast(error.message || 'Ошибка удаления участника', 'error')
  } finally {
    removingMember.value = null
  }
}

// Изменить роль участника
const handleChangeRole = async (userId: string, newRole: UserRole) => {
  if (!company.value) return

  try {
    company.value = await companiesApi.updateMemberRole(company.value.id, userId, newRole)
    showToast('Роль участника изменена', 'success')
  } catch (error: any) {
    console.error('Ошибка изменения роли:', error)
    showToast(error.message || 'Ошибка изменения роли', 'error')
  }
}

// Открыть чат с участником (placeholder)
const handleOpenChat = (userId: string) => {
  showToast('Функция чата будет доступна в следующей версии', 'info')
  // В Stage 12 будет: router.push(`/messages?userId=${userId}`)
}

// Пользователи, доступные для приглашения
const availableUsers = computed(() => {
  if (!company.value) return []

  const memberIds = new Set(company.value.members.map((m) => m.userId))
  const invitedUserIds = new Set(
    invitations.value.filter((inv) => inv.status === 'pending').map((inv) => inv.invitedUserId),
  )

  return allUsers.value.filter(
    (user) =>
      !memberIds.has(user.id) && // Не является участником
      !invitedUserIds.has(user.id) && // Нет активного приглашения
      !user.companyId && // Не состоит в другой компании
      user.id !== currentUser.value?.id, // Не сам пользователь
  )
})

// Загрузить приглашения и пользователей
const loadInvitationsAndUsers = async () => {
  if (!company.value || !isCompanyAdmin.value) return

  try {
    const [invs, users] = await Promise.all([
      invitationsApi.getCompanyInvitations(company.value.id),
      usersApi.getUsers(),
    ])

    invitations.value = invs.filter((inv) => inv.status === 'pending')
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
    await invitationsApi.createInvitation(currentUser.value.id, {
      companyId: company.value.id,
      invitedUserId: selectedUserId.value,
      message: invitationMessage.value,
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
    await invitationsApi.cancelInvitation(invitationId, currentUser.value.id)
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
            <h2 class="text-2xl font-semibold text-text">{{ company.name }}</h2>
            <div class="flex items-center gap-2">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  company.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : company.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800',
                ]"
              >
                {{
                  company.status === 'active'
                    ? 'Активна'
                    : company.status === 'pending'
                      ? 'На проверке'
                      : 'Отклонена'
                }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div class="text-gray-500 mb-1">ОГРН</div>
              <div v-if="!isCompanyAdmin" class="font-medium text-text">{{ company.ogrn }}</div>
              <input
                v-else
                v-model="companyForm.ogrn"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <div class="text-gray-500 mb-1">ИНН</div>
              <div v-if="!isCompanyAdmin" class="font-medium text-text">{{ company.inn }}</div>
              <input
                v-else
                v-model="companyForm.inn"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <div class="text-gray-500 mb-1">КПП</div>
              <div v-if="!isCompanyAdmin" class="font-medium text-text">{{ company.kpp }}</div>
              <input
                v-else
                v-model="companyForm.kpp"
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

            <div>
              <div class="text-gray-500 mb-1">Директор</div>
              <div v-if="!isCompanyAdmin" class="font-medium text-text">{{ company.director }}</div>
              <input
                v-else
                v-model="companyForm.director"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div class="md:col-span-2">
              <div class="text-gray-500 mb-1">Юридический адрес</div>
              <div v-if="!isCompanyAdmin" class="font-medium text-text">
                {{ company.legalAddress }}
              </div>
              <input
                v-else
                v-model="companyForm.legalAddress"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div class="md:col-span-2">
              <div class="text-gray-500 mb-1">Фактический адрес</div>
              <div v-if="!isCompanyAdmin" class="font-medium text-text">
                {{ company.actualAddress }}
              </div>
              <input
                v-else
                v-model="companyForm.actualAddress"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div class="md:col-span-2">
              <div class="text-gray-500 mb-1">Дата создания</div>
              <div class="font-medium text-text">{{ formatDate(company.createdAt) }}</div>
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
              Участники ({{ company.members.length }})
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

          <div v-if="company.members.length > 0" class="space-y-3">
            <div
              v-for="member in company.members"
              :key="member.userId"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="font-semibold text-text">{{ member.user.fullName }}</h3>
                  <span
                    :class="['px-2 py-1 rounded text-xs font-medium', getRoleBadgeColor(member.role)]"
                  >
                    {{ getRoleLabel(member.role) }}
                  </span>
                </div>

                <div class="text-sm text-gray-600">
                  <div>Email: {{ member.user.email }}</div>
                  <div>Присоединился: {{ formatDate(member.joinedAt) }}</div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <AppButton variant="outline" size="sm" @click="handleOpenChat(member.userId)">
                  Написать
                </AppButton>

                <div v-if="isCompanyAdmin && member.userId !== currentUser?.id">
                  <!-- Изменение роли -->
                  <select
                    :value="member.role"
                    @change="
                      handleChangeRole(member.userId, ($event.target as HTMLSelectElement).value as UserRole)
                    "
                    class="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option :value="UserRole.COMPANY_MANAGER">Менеджер</option>
                    <option :value="UserRole.COMPANY_ADMIN">Админ</option>
                  </select>

                  <!-- Удаление -->
                  <AppButton
                    variant="danger"
                    size="sm"
                    :loading="removingMember === member.userId"
                    @click="handleRemoveMember(member.userId)"
                    class="ml-2"
                  >
                    Удалить
                  </AppButton>
                </div>
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
                <h3 class="font-semibold text-text mb-1">{{ invitation.invitedUser.fullName }}</h3>
                <div class="text-sm text-gray-600">
                  <div>Email: {{ invitation.invitedUser.email }}</div>
                  <div>Отправлено: {{ formatDate(invitation.createdAt) }}</div>
                  <div v-if="invitation.message" class="mt-1 italic">{{ invitation.message }}</div>
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
                  {{ user.fullName }} ({{ user.email }})
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
