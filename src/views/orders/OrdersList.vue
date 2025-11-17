<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Order, OrderStatus, OrderFilters } from '@/types/order.types'
import { useAuth } from '@/composables/useAuth'
import { ordersApi, getOrderStatusLabel, getOrderStatusColor } from '@/services/api/orders.api'
import MainLayout from '@/components/layout/MainLayout.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppLoader from '@/components/common/AppLoader.vue'

const router = useRouter()
const { currentUser, hasCompany } = useAuth()

const loading = ref(false)
const orders = ref<Order[]>([])
const stats = ref({
  total: 0,
  new: 0,
  inProgress: 0,
  completed: 0,
  cancelled: 0,
})

// Фильтры
const filters = ref<OrderFilters>({
  status: [],
  dateFrom: '',
  dateTo: '',
})

// Активная вкладка статуса
const activeStatusTab = ref<'all' | 'new' | 'active' | 'completed' | 'cancelled'>('all')

// Отфильтрованные заказы
const filteredOrders = computed(() => {
  let result = orders.value

  // Фильтр по вкладке
  if (activeStatusTab.value === 'new') {
    result = result.filter((order) => order.status === 'new')
  } else if (activeStatusTab.value === 'active') {
    result = result.filter((order) =>
      ['pending', 'confirmed', 'in_progress', 'shipped'].includes(order.status),
    )
  } else if (activeStatusTab.value === 'completed') {
    result = result.filter((order) => order.status === 'delivered')
  } else if (activeStatusTab.value === 'cancelled') {
    result = result.filter((order) => order.status === 'cancelled')
  }

  return result
})

// Загрузка заказов и статистики
const loadOrders = async () => {
  if (!currentUser.value) return

  loading.value = true

  try {
    // Загружаем заказы
    const companyId = currentUser.value.companyId
    orders.value = await ordersApi.getOrders(currentUser.value.id, companyId, filters.value)

    // Загружаем статистику
    stats.value = await ordersApi.getOrdersStats(companyId)
  } catch (error) {
    console.error('Ошибка загрузки заказов:', error)
  } finally {
    loading.value = false
  }
}

// Форматирование даты
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

// Форматирование суммы
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(price)
}

// Переход к деталям заказа
const goToOrderDetails = (orderId: string) => {
  router.push(`/orders/${orderId}`)
}

// Смена активной вкладки
const setActiveTab = (tab: typeof activeStatusTab.value) => {
  activeStatusTab.value = tab
}

onMounted(() => {
  loadOrders()
})
</script>

<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-6">
      <!-- Заголовок -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-text">Заказы</h1>
        <p class="text-gray-600 mt-1">Управление заказами вашей компании</p>
      </div>

      <!-- Статистика -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <AppCard class="cursor-pointer hover:shadow-lg transition-shadow" @click="setActiveTab('all')">
          <div class="text-center">
            <div class="text-3xl font-bold text-primary">{{ stats.total }}</div>
            <div class="text-sm text-gray-600 mt-1">Всего заказов</div>
          </div>
        </AppCard>

        <AppCard
          class="cursor-pointer hover:shadow-lg transition-shadow"
          @click="setActiveTab('new')"
        >
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{ stats.new }}</div>
            <div class="text-sm text-gray-600 mt-1">Новые</div>
          </div>
        </AppCard>

        <AppCard
          class="cursor-pointer hover:shadow-lg transition-shadow"
          @click="setActiveTab('active')"
        >
          <div class="text-center">
            <div class="text-3xl font-bold text-yellow-600">{{ stats.inProgress }}</div>
            <div class="text-sm text-gray-600 mt-1">В работе</div>
          </div>
        </AppCard>

        <AppCard
          class="cursor-pointer hover:shadow-lg transition-shadow"
          @click="setActiveTab('completed')"
        >
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">{{ stats.completed }}</div>
            <div class="text-sm text-gray-600 mt-1">Завершённые</div>
          </div>
        </AppCard>

        <AppCard
          class="cursor-pointer hover:shadow-lg transition-shadow"
          @click="setActiveTab('cancelled')"
        >
          <div class="text-center">
            <div class="text-3xl font-bold text-red-600">{{ stats.cancelled }}</div>
            <div class="text-sm text-gray-600 mt-1">Отменённые</div>
          </div>
        </AppCard>
      </div>

      <!-- Вкладки статусов -->
      <div class="flex gap-2 mb-6 border-b border-gray-300 overflow-x-auto">
        <button
          v-for="tab in [
            { key: 'all', label: 'Все заказы' },
            { key: 'new', label: 'Новые' },
            { key: 'active', label: 'В работе' },
            { key: 'completed', label: 'Завершённые' },
            { key: 'cancelled', label: 'Отменённые' },
          ]"
          :key="tab.key"
          @click="setActiveTab(tab.key as 'all' | 'new' | 'active' | 'completed' | 'cancelled')"
          :class="[
            'px-4 py-2 font-medium transition-colors whitespace-nowrap',
            activeStatusTab === tab.key
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-primary',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Загрузка -->
      <AppLoader v-if="loading" class="py-12" />

      <!-- Список заказов -->
      <div v-else-if="filteredOrders.length > 0" class="space-y-4">
        <AppCard
          v-for="order in filteredOrders"
          :key="order.id"
          class="hover:shadow-lg transition-shadow cursor-pointer"
          @click="goToOrderDetails(order.id)"
        >
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <!-- Основная информация -->
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-semibold text-text">Заказ №{{ order.id }}</h3>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium',
                    getOrderStatusColor(order.status),
                  ]"
                >
                  {{ getOrderStatusLabel(order.status) }}
                </span>
              </div>

              <div class="text-sm text-gray-600 space-y-1">
                <div>
                  <span class="font-medium">Дата создания:</span>
                  {{ formatDate(order.createdAt) }}
                </div>
                <div>
                  <span class="font-medium">Создал:</span>
                  {{ order.createdByName }}
                </div>
                <div v-if="order.assignedManagerName">
                  <span class="font-medium">Менеджер:</span>
                  {{ order.assignedManagerName }}
                </div>
                <div>
                  <span class="font-medium">Позиций:</span>
                  {{ order.items.length }}
                </div>
              </div>
            </div>

            <!-- Сумма и действия -->
            <div class="flex flex-col items-end gap-3">
              <div class="text-2xl font-bold text-primary">{{ formatPrice(order.total) }}</div>

              <AppButton variant="primary" size="sm" @click.stop="goToOrderDetails(order.id)">
                Подробнее
              </AppButton>
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p class="text-lg text-gray-600 mb-2">Заказов пока нет</p>
        <p class="text-sm text-gray-500 mb-4">
          Создайте первый заказ, добавив товары в корзину
        </p>
        <AppButton variant="primary" @click="router.push('/products')"> Перейти к товарам </AppButton>
      </AppCard>
    </div>
  </MainLayout>
</template>
