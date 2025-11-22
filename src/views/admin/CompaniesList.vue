<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Company } from '@/types/company.types'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { companiesApi } from '@/services/api/companies.api'
import { formatters } from '@/utils/formatters'
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
        company.title.toLowerCase().includes(query) ||
        company.OGRN.includes(query) ||
        company.INN.includes(query)
    )
  }

  // Фильтр по статусу - убрано, так как в Company нет поля status

  return result
})

// Статистика
const stats = computed(() => ({
  total: companies.value.length,
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

// Удалить компанию
const handleDeleteCompany = async (companyId: string) => {
  if (!confirm('Вы уверены, что хотите удалить эту компанию?')) return

  updatingStatus.value = companyId

  try {
    await companiesApi.deleteCompany(companyId)

    // Удаляем локально
    const index = companies.value.findIndex((c) => c.id === companyId)
    if (index !== -1) {
      companies.value.splice(index, 1)
    }

    showToast('Компания удалена', 'success')
  } catch (error: any) {
    console.error('Ошибка удаления компании:', error)
    showToast(error.message || 'Ошибка удаления компании', 'error')
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
      <div class="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
        <AppCard>
          <div class="text-center">
            <div class="text-3xl font-bold text-primary">{{ stats.total }}</div>
            <div class="text-sm text-gray-600 mt-1">Всего компаний</div>
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
                  <h3 class="text-xl font-semibold text-text">{{ company.title }}</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                  <div>
                    <span class="font-medium">ОГРН:</span> {{ company.OGRN }}
                  </div>
                  <div>
                    <span class="font-medium">ИНН:</span> {{ company.INN }}
                  </div>
                  <div>
                    <span class="font-medium">КПП:</span> {{ company.KPP }}
                  </div>
                  <div>
                    <span class="font-medium">Телефон:</span> {{ company.phone }}
                  </div>
                  <div>
                    <span class="font-medium">Email:</span> {{ company.email }}
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

                <AppButton
                  variant="danger"
                  size="sm"
                  :loading="updatingStatus === company.id"
                  @click="handleDeleteCompany(company.id)"
                >
                  Удалить
                </AppButton>
              </div>
            </div>

            <!-- Развернутая информация -->
            <div v-if="expandedCompany === company.id" class="border-t border-gray-200 pt-4 mt-2">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <div class="font-medium text-gray-700 mb-1">Адрес</div>
                  <div class="text-gray-600">{{ company.address }}</div>
                </div>
                <div>
                  <div class="font-medium text-gray-700 mb-1">Расчетный счет</div>
                  <div class="text-gray-600">{{ company.checking_account }}</div>
                </div>
                <div>
                  <div class="font-medium text-gray-700 mb-1">Название банка</div>
                  <div class="text-gray-600">{{ company.bank_name }}</div>
                </div>
                <div>
                  <div class="font-medium text-gray-700 mb-1">БИК</div>
                  <div class="text-gray-600">{{ company.BIK }}</div>
                </div>
                <div>
                  <div class="font-medium text-gray-700 mb-1">Корреспондентский счет</div>
                  <div class="text-gray-600">{{ company.correspondent_account }}</div>
                </div>
              </div>

              <!-- Участники -->
              <div class="mb-4">
                <div class="font-medium text-gray-700 mb-2">
                  Участники ({{ company.users?.length || 0 }})
                </div>
                <div v-if="company.users && company.users.length > 0" class="space-y-2">
                  <div
                    v-for="user in company.users"
                    :key="user.id"
                    class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div class="font-medium text-text">{{ formatters.fullName(user) }}</div>
                      <div class="text-xs text-gray-600">{{ user.email }}</div>
                    </div>
                    <span v-if="user.role" class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {{ user.role.title === 'client-admin' ? 'Админ' : 'Менеджер' }}
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
