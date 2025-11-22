<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Order } from '@/types/order.types'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { ordersApi, getOrderStatusLabel, getOrderStatusColor } from '@/services/api/orders.api'
import MainLayout from '@/components/layout/MainLayout.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppLoader from '@/components/common/AppLoader.vue'

const router = useRouter()
const route = useRoute()
const { currentUser } = useAuth()
const { showToast } = useToast()

const loading = ref(false)
const cancelling = ref(false)
const order = ref<Order | null>(null)

const orderId = computed(() => route.params.id as string)

// Можно ли отменить заказ
const canCancelOrder = computed(() => {
  if (!order.value) return false
  return order.value.status !== 'canceled' && order.value.status !== 'accepted'
})

// Загрузка заказа
const loadOrder = async () => {
  loading.value = true

  try {
    order.value = await ordersApi.getOrderById(orderId.value)

    if (!order.value) {
      showToast('Заказ не найден', 'error')
      router.push('/orders')
    }
  } catch (error) {
    console.error('Ошибка загрузки заказа:', error)
    showToast('Ошибка загрузки заказа', 'error')
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

// Отмена заказа
const handleCancelOrder = async () => {
  if (!order.value || !canCancelOrder.value) return

  if (!confirm('Вы уверены, что хотите отменить заказ?')) return

  cancelling.value = true

  try {
    order.value = await ordersApi.cancelOrder(order.value.id)
    showToast('Заказ успешно отменён', 'success')
  } catch (error: any) {
    console.error('Ошибка отмены заказа:', error)
    showToast(error.message || 'Ошибка отмены заказа', 'error')
  } finally {
    cancelling.value = false
  }
}

// Переход к чату с менеджером (для Stage 12)
const handleOpenChat = () => {
  showToast('Функция чата будет доступна в следующей версии', 'info')
  // В Stage 12 будет: router.push(`/messages?orderId=${order.value.id}`)
}


// Вернуться к списку
const goBack = () => {
  router.push('/orders')
}

onMounted(() => {
  loadOrder()
})
</script>

<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-6">
      <!-- Навигация назад -->
      <div class="mb-4">
        <AppButton variant="outline" size="sm" @click="goBack">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Назад к заказам
        </AppButton>
      </div>

      <!-- Загрузка -->
      <AppLoader v-if="loading" class="py-12" />

      <!-- Детали заказа -->
      <div v-else-if="order" class="space-y-6">
        <!-- Заголовок и статус -->
        <AppCard>
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 class="text-3xl font-bold text-text mb-2">Заказ №{{ order.id }}</h1>
              <div class="flex items-center gap-3 mb-4">
                <span
                  :class="[
                    'px-4 py-2 rounded-full text-sm font-medium',
                    getOrderStatusColor(order.status),
                  ]"
                >
                  {{ getOrderStatusLabel(order.status) }}
                </span>
              </div>
              <div class="text-sm text-gray-600 space-y-1">
                <div>
                  <span class="font-medium">Дата:</span>
                  {{ formatDate(order.date) }}
                </div>
              </div>
            </div>

            <div class="text-right">
              <div class="flex flex-col gap-2">
                <AppButton
                  v-if="canCancelOrder"
                  variant="danger"
                  :loading="cancelling"
                  @click="handleCancelOrder"
                >
                  Отменить заказ
                </AppButton>
                <AppButton variant="outline" @click="handleOpenChat">
                  Написать менеджеру
                </AppButton>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Информация о компании и менеджерах -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Информация о заказе -->
          <AppCard>
            <h2 class="text-xl font-semibold text-text mb-4">Информация о заказе</h2>
            <div class="space-y-3 text-sm">
              <div>
                <div class="text-gray-500 mb-1">Компания</div>
                <div class="font-medium text-text">{{ order.company_id }}</div>
              </div>
              <div>
                <div class="text-gray-500 mb-1">Создал заказ</div>
                <div class="font-medium text-text">{{ order.user?.first_name }} {{ order.user?.last_name }}</div>
              </div>
            </div>
          </AppCard>

        </div>

        <!-- Список серий -->
        <AppCard>
          <h2 class="text-xl font-semibold text-text mb-4">
            Серии ({{ order.series?.length || 0 }})
          </h2>

          <div v-if="order.series && order.series.length > 0" class="space-y-4">
            <div
              v-for="orderSeries in order.series"
              :key="orderSeries.series_id"
              class="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <!-- Информация о серии -->
              <div class="flex-1">
                <h3 class="font-semibold text-text mb-2">
                  {{ orderSeries.series?.title || `Серия #${orderSeries.series_id}` }}
                </h3>

                <div class="text-sm text-gray-600 space-y-1">
                  <div v-if="orderSeries.series?.amount !== null && orderSeries.series?.amount !== undefined">
                    <span class="font-medium">Доступно:</span> {{ orderSeries.series.amount }} кг
                  </div>
                  <div v-if="orderSeries.series?.product_id">
                    <span class="font-medium">ID продукта:</span> {{ orderSeries.series.product_id }}
                  </div>
                </div>
              </div>

              <!-- Количество -->
              <div class="flex flex-col items-end justify-between">
                <div class="text-right">
                  <div class="text-lg font-semibold text-text">
                    Количество: {{ orderSeries.amount }} кг
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            Нет серий в заказе
          </div>
        </AppCard>
      </div>

      <!-- Заказ не найден -->
      <AppCard v-else class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p class="text-lg text-gray-600 mb-4">Заказ не найден</p>
        <AppButton variant="primary" @click="goBack"> Вернуться к списку </AppButton>
      </AppCard>
    </div>
  </MainLayout>
</template>



