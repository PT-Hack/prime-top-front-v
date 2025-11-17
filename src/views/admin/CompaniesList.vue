<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Company } from '@/types/company.types'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { companiesApi } from '@/services/api/companies.api'
import MainLayout from '@/components/layout/MainLayout.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppLoader from '@/components/common/AppLoader.vue'

const router = useRouter()
const { currentUser } = useAuth()
const { showToast } = useToast()

const loading = ref(false)
const companies = ref<Company[]>([])
const searchQuery = ref('')
const statusFilter = ref<'all' | 'pending' | 'active' | 'rejected'>('all')
const expandedCompany = ref<string | null>(null)
const updatingStatus = ref<string | null>(null)

// Отфильтрованные компании
const filteredCompanies = computed(() => {
  let result = companies.value

  // Фильтр по поиску
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (company) =>
        company.name.toLowerCase().includes(query) ||
        company.ogrn.includes(query) ||
        company.inn.includes(query)
    )
  }

  // Фильтр по статусу
  if (statusFilter.value !== 'all') {
    result = result.filter((company) => company.status === statusFilter.value)
  }

  return result
})

// Статистика
const stats = computed(() => ({
  total: companies.value.length,
  pending: companies.value.filter((c) => c.status === 'pending').length,
  active: companies.value.filter((c) => c.status === 'active').length,
  rejected: companies.value.filter((c) => c.status === 'rejected').length,
}))

// Загрузка компаний
const loadCompanies = async () => {
  loading.value = true

  try {
    companies.value = await companiesApi.getCompanies()
  } catch (error) {
    console.error('Ошибка загрузки компаний:', error)
    showToast('Ошибка загрузки компаний', 'error')
  } finally {
    loading.value = false
  }
}

// Одобрить компанию
const handleApproveCompany = async (companyId: string) => {
  updatingStatus.value = companyId

  try {
    await companiesApi.updateCompany(companyId, { status: 'active' })

    // Обновляем локально
    const company = companies.value.find((c) => c.id === companyId)
    if (company) {
      company.status = 'active'
    }

    showToast('Компания одобрена', 'success')
  } catch (error: any) {
    console.error('Ошибка одобрения компании:', error)
    showToast(error.message || 'Ошибка одобрения компании', 'error')
  } finally {
    updatingStatus.value = null
  }
}

// Отклонить компанию
const handleRejectCompany = async (companyId: string) => {
  if (!confirm('Вы уверены, что хотите отклонить эту компанию?')) return

  updatingStatus.value = companyId

  try {
    await companiesApi.updateCompany(companyId, { status: 'rejected' })

    // Обновляем локально
    const company = companies.value.find((c) => c.id === companyId)
    if (company) {
      company.status = 'rejected'
    }

    showToast('Компания отклонена', 'success')
  } catch (error: any) {
    console.error('Ошибка отклонения компании:', error)
    showToast(error.message || 'Ошибка отклонения компании', 'error')
  } finally {
    updatingStatus.value = null
  }
}

// Переключить развернутое состояние
const toggleExpanded = (companyId: string) => {
  expandedCompany.value = expandedCompany.value === companyId ? null : companyId
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
  loadCompanies()
})
</script>

<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-6">
      <!-- Заголовок -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-text">Управление компаниями</h1>
        <p class="text-gray-600 mt-1">Список всех компаний в системе</p>
      </div>

      <!-- Статистика -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <AppCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="statusFilter = 'all'">
          <div class="text-center">
            <div class="text-3xl font-bold text-primary">{{ stats.total }}</div>
            <div class="text-sm text-gray-600 mt-1">Всего компаний</div>
          </div>
        </AppCard>

        <AppCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="statusFilter = 'pending'">
          <div class="text-center">
            <div class="text-3xl font-bold text-yellow-600">{{ stats.pending }}</div>
            <div class="text-sm text-gray-600 mt-1">На проверке</div>
          </div>
        </AppCard>

        <AppCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="statusFilter = 'active'">
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">{{ stats.active }}</div>
            <div class="text-sm text-gray-600 mt-1">Активные</div>
          </div>
        </AppCard>

        <AppCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="statusFilter = 'rejected'">
          <div class="text-center">
            <div class="text-3xl font-bold text-red-600">{{ stats.rejected }}</div>
            <div class="text-sm text-gray-600 mt-1">Отклонённые</div>
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
              placeholder="Поиск по названию, ОГРН или ИНН..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div class="flex gap-2 flex-wrap">
            <button
              @click="statusFilter = 'all'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors border-2',
                statusFilter === 'all'
                  ? 'bg-[#054787] text-white border-[#054787]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#054787] hover:bg-gray-50',
              ]"
            >
              Все
            </button>
            <button
              @click="statusFilter = 'pending'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors border-2',
                statusFilter === 'pending'
                  ? 'bg-[#054787] text-white border-[#054787]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#054787] hover:bg-gray-50',
              ]"
            >
              На проверке
            </button>
            <button
              @click="statusFilter = 'active'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors border-2',
                statusFilter === 'active'
                  ? 'bg-[#054787] text-white border-[#054787]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#054787] hover:bg-gray-50',
              ]"
            >
              Активные
            </button>
            <button
              @click="statusFilter = 'rejected'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors border-2',
                statusFilter === 'rejected'
                  ? 'bg-[#054787] text-white border-[#054787]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#054787] hover:bg-gray-50',
              ]"
            >
              Отклонённые
            </button>
          </div>
        </div>
      </AppCard>

      <!-- Загрузка -->
      <AppLoader v-if="loading" class="py-12" />

      <!-- Список компаний -->
      <div v-else-if="filteredCompanies.length > 0" class="space-y-4">
        <AppCard
          v-for="company in filteredCompanies"
          :key="company.id"
          class="hover:shadow-lg transition-shadow"
        >
          <div class="flex flex-col gap-4">
            <!-- Основная информация -->
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-xl font-semibold text-text">{{ company.name }}</h3>
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

                <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                  <div>
                    <span class="font-medium">ОГРН:</span> {{ company.ogrn }}
                  </div>
                  <div>
                    <span class="font-medium">ИНН:</span> {{ company.inn }}
                  </div>
                  <div>
                    <span class="font-medium">КПП:</span> {{ company.kpp }}
                  </div>
                  <div>
                    <span class="font-medium">Телефон:</span> {{ company.phone }}
                  </div>
                  <div>
                    <span class="font-medium">Email:</span> {{ company.email }}
                  </div>
                  <div>
                    <span class="font-medium">Дата создания:</span> {{ formatDate(company.createdAt) }}
                  </div>
                </div>
              </div>

              <!-- Действия -->
              <div class="flex flex-col gap-2 ml-4">
                <AppButton
                  variant="outline"
                  size="sm"
                  @click="toggleExpanded(company.id)"
                >
                  {{ expandedCompany === company.id ? 'Скрыть' : 'Подробнее' }}
                </AppButton>

                <div v-if="company.status === 'pending'" class="flex gap-2">
                  <AppButton
                    variant="primary"
                    size="sm"
                    :loading="updatingStatus === company.id"
                    @click="handleApproveCompany(company.id)"
                  >
                    Одобрить
                  </AppButton>
                  <AppButton
                    variant="danger"
                    size="sm"
                    :loading="updatingStatus === company.id"
                    @click="handleRejectCompany(company.id)"
                  >
                    Отклонить
                  </AppButton>
                </div>
              </div>
            </div>

            <!-- Развернутая информация -->
            <div v-if="expandedCompany === company.id" class="border-t border-gray-200 pt-4 mt-2">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <div class="font-medium text-gray-700 mb-1">Юридический адрес</div>
                  <div class="text-gray-600">{{ company.legalAddress }}</div>
                </div>
                <div>
                  <div class="font-medium text-gray-700 mb-1">Фактический адрес</div>
                  <div class="text-gray-600">{{ company.actualAddress }}</div>
                </div>
                <div>
                  <div class="font-medium text-gray-700 mb-1">Директор</div>
                  <div class="text-gray-600">{{ company.director }}</div>
                </div>
              </div>

              <!-- Участники -->
              <div class="mb-4">
                <div class="font-medium text-gray-700 mb-2">
                  Участники ({{ company.members.length }})
                </div>
                <div v-if="company.members.length > 0" class="space-y-2">
                  <div
                    v-for="member in company.members"
                    :key="member.userId"
                    class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div class="font-medium text-text">{{ member.user.fullName }}</div>
                      <div class="text-xs text-gray-600">{{ member.user.email }}</div>
                    </div>
                    <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {{ member.role === 'company_admin' ? 'Админ' : 'Менеджер' }}
                    </span>
                  </div>
                </div>
                <div v-else class="text-gray-500 text-sm">Нет участников</div>
              </div>
            </div>
          </div>
        </AppCard>
      </div>

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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <p class="text-lg text-gray-600">Компании не найдены</p>
      </AppCard>
    </div>
  </MainLayout>
</template>
