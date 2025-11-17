<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { User } from '@/types/auth.types'
import { UserRole } from '@/types/auth.types'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { usersApi } from '@/services/api/users.api'
import MainLayout from '@/components/layout/MainLayout.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppLoader from '@/components/common/AppLoader.vue'

const { currentUser } = useAuth()
const { showToast } = useToast()

const loading = ref(false)
const users = ref<User[]>([])
const searchQuery = ref('')
const roleFilter = ref<UserRole | 'all'>('all')
const deletingUser = ref<string | null>(null)
const promotingUser = ref<string | null>(null)

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

// Отфильтрованные пользователи
const filteredUsers = computed(() => {
  let result = users.value

  // Фильтр по поиску
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (user) =>
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    )
  }

  // Фильтр по роли
  if (roleFilter.value !== 'all') {
    result = result.filter((user) => user.role === roleFilter.value)
  }

  return result
})

// Статистика по ролям
const stats = computed(() => ({
  total: users.value.length,
  user: users.value.filter((u) => u.role === UserRole.USER).length,
  companyManager: users.value.filter((u) => u.role === UserRole.COMPANY_MANAGER).length,
  companyAdmin: users.value.filter((u) => u.role === UserRole.COMPANY_ADMIN).length,
  systemManager: users.value.filter((u) => u.role === UserRole.SYSTEM_MANAGER).length,
  systemAdmin: users.value.filter((u) => u.role === UserRole.SYSTEM_ADMIN).length,
}))

// Загрузка пользователей
const loadUsers = async () => {
  loading.value = true

  try {
    users.value = await usersApi.getUsers()
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error)
    showToast('Ошибка загрузки пользователей', 'error')
  } finally {
    loading.value = false
  }
}

// Удалить пользователя
const handleDeleteUser = async (userId: string) => {
  if (userId === currentUser.value?.id) {
    showToast('Нельзя удалить самого себя', 'error')
    return
  }

  if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return

  deletingUser.value = userId

  try {
    await usersApi.deleteUser(userId)

    // Удаляем локально
    const index = users.value.findIndex((u) => u.id === userId)
    if (index !== -1) {
      users.value.splice(index, 1)
    }

    showToast('Пользователь удалён', 'success')
  } catch (error: any) {
    console.error('Ошибка удаления пользователя:', error)
    showToast(error.message || 'Ошибка удаления пользователя', 'error')
  } finally {
    deletingUser.value = null
  }
}

// Повысить до system_manager
const handlePromoteToSystemManager = async (userId: string) => {
  if (!confirm('Повысить пользователя до менеджера системы?')) return

  promotingUser.value = userId

  try {
    await usersApi.updateUserRole(userId, UserRole.SYSTEM_MANAGER)

    // Обновляем локально
    const user = users.value.find((u) => u.id === userId)
    if (user) {
      user.role = UserRole.SYSTEM_MANAGER
    }

    showToast('Пользователь повышен до менеджера системы', 'success')
  } catch (error: any) {
    console.error('Ошибка повышения пользователя:', error)
    showToast(error.message || 'Ошибка повышения пользователя', 'error')
  } finally {
    promotingUser.value = null
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
  loadUsers()
})
</script>

<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-6">
      <!-- Заголовок -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-text">Управление пользователями</h1>
        <p class="text-gray-600 mt-1">Список всех пользователей системы</p>
      </div>

      <!-- Статистика -->
      <div class="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <AppCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="roleFilter = 'all'">
          <div class="text-center">
            <div class="text-2xl font-bold text-primary">{{ stats.total }}</div>
            <div class="text-xs text-gray-600 mt-1">Всего</div>
          </div>
        </AppCard>

        <AppCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="roleFilter = UserRole.USER">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ stats.user }}</div>
            <div class="text-xs text-gray-600 mt-1">Пользователи</div>
          </div>
        </AppCard>

        <AppCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="roleFilter = UserRole.COMPANY_MANAGER">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ stats.companyManager }}</div>
            <div class="text-xs text-gray-600 mt-1">Менеджеры</div>
          </div>
        </AppCard>

        <AppCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="roleFilter = UserRole.COMPANY_ADMIN">
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ stats.companyAdmin }}</div>
            <div class="text-xs text-gray-600 mt-1">Админы комп.</div>
          </div>
        </AppCard>

        <AppCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="roleFilter = UserRole.SYSTEM_MANAGER">
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">{{ stats.systemManager }}</div>
            <div class="text-xs text-gray-600 mt-1">Менед. сист.</div>
          </div>
        </AppCard>

        <AppCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="roleFilter = UserRole.SYSTEM_ADMIN">
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">{{ stats.systemAdmin }}</div>
            <div class="text-xs text-gray-600 mt-1">Админы сист.</div>
          </div>
        </AppCard>
      </div>

      <!-- Поиск и фильтры -->
      <AppCard class="mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск по имени или email..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div class="flex gap-2 flex-wrap">
            <button
              @click="roleFilter = 'all'"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors border-2',
                roleFilter === 'all'
                  ? 'bg-[#054787] text-white border-[#054787]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#054787] hover:bg-gray-50',
              ]"
            >
              Все
            </button>
            <button
              @click="roleFilter = UserRole.USER"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors border-2',
                roleFilter === UserRole.USER
                  ? 'bg-[#054787] text-white border-[#054787]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#054787] hover:bg-gray-50',
              ]"
            >
              Пользователи
            </button>
            <button
              @click="roleFilter = UserRole.COMPANY_MANAGER"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors border-2',
                roleFilter === UserRole.COMPANY_MANAGER
                  ? 'bg-[#054787] text-white border-[#054787]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#054787] hover:bg-gray-50',
              ]"
            >
              Менеджеры
            </button>
            <button
              @click="roleFilter = UserRole.COMPANY_ADMIN"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors border-2',
                roleFilter === UserRole.COMPANY_ADMIN
                  ? 'bg-[#054787] text-white border-[#054787]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#054787] hover:bg-gray-50',
              ]"
            >
              Админы
            </button>
          </div>
        </div>
      </AppCard>

      <!-- Загрузка -->
      <AppLoader v-if="loading" class="py-12" />

      <!-- Таблица пользователей -->
      <AppCard v-else-if="filteredUsers.length > 0">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Пользователь</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Роль</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Компания</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата регистрации</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="user in filteredUsers"
                :key="user.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                      {{ user.fullName.charAt(0).toUpperCase() }}
                    </div>
                    <div class="ml-3">
                      <div class="font-medium text-text">{{ user.fullName }}</div>
                      <div class="text-xs text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {{ user.email }}
                </td>
                <td class="px-4 py-3">
                  <span :class="['px-2 py-1 rounded text-xs font-medium', getRoleBadgeColor(user.role)]">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  <span v-if="user.companyId">Да</span>
                  <span v-else class="text-gray-400">Нет</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {{ formatDate(user.createdAt) }}
                </td>
                <td class="px-4 py-3 text-right">
                  <div v-if="user.id !== currentUser?.id" class="flex justify-end gap-2">
                    <!-- Кнопка повышения до system_manager -->
                    <AppButton
                      v-if="user.role !== UserRole.SYSTEM_MANAGER && user.role !== UserRole.SYSTEM_ADMIN"
                      variant="primary"
                      size="sm"
                      :loading="promotingUser === user.id"
                      @click="handlePromoteToSystemManager(user.id)"
                    >
                      Повысить
                    </AppButton>
                    <!-- Кнопка удаления -->
                    <AppButton
                      variant="danger"
                      size="sm"
                      :loading="deletingUser === user.id"
                      @click="handleDeleteUser(user.id)"
                    >
                      Удалить
                    </AppButton>
                  </div>
                  <span v-else class="text-xs text-gray-400 italic">Вы</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AppCard>

      <!-- Пустое состояние -->
      <AppCard v-else class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg
            class="mx-auto h-16 w-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <p class="text-lg text-gray-600">Пользователи не найдены</p>
      </AppCard>
    </div>
  </MainLayout>
</template>
