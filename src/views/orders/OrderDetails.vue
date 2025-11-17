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
  return !['delivered', 'shipped', 'cancelled'].includes(order.value.status)
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

// Переход к товару
const goToProduct = (productId: string) => {
  router.push(`/products/${productId}`)
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
                  <span class="font-medium">Дата создания:</span>
                  {{ formatDate(order.createdAt) }}
                </div>
                <div>
                  <span class="font-medium">Последнее обновление:</span>
                  {{ formatDate(order.updatedAt) }}
                </div>
              </div>
            </div>

            <div class="text-right">
              <div class="text-3xl font-bold text-primary mb-4">{{ formatPrice(order.total) }}</div>
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
                <div class="font-medium text-text">{{ order.companyName }}</div>
              </div>
              <div>
                <div class="text-gray-500 mb-1">Создал заказ</div>
                <div class="font-medium text-text">{{ order.createdByName }}</div>
              </div>
              <div v-if="order.assignedManagerName">
                <div class="text-gray-500 mb-1">Менеджер производителя</div>
                <div class="font-medium text-text">{{ order.assignedManagerName }}</div>
              </div>
              <div v-else>
                <div class="text-gray-500 mb-1">Менеджер производителя</div>
                <div class="text-yellow-600">Ожидает назначения</div>
              </div>
            </div>
          </AppCard>

          <!-- Примечания -->
          <AppCard>
            <h2 class="text-xl font-semibold text-text mb-4">Примечания к заказу</h2>
            <div v-if="order.notes" class="text-sm text-gray-700">
              {{ order.notes }}
            </div>
            <div v-else class="text-sm text-gray-400 italic">Примечаний нет</div>
          </AppCard>
        </div>

        <!-- Список товаров -->
        <AppCard>
          <h2 class="text-xl font-semibold text-text mb-4">
            Товары ({{ order.items.length }})
          </h2>

          <div class="space-y-4">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              @click="goToProduct(item.productId)"
            >
              <!-- Изображение товара -->
              <div class="flex-shrink-0">
                <img
                  v-if="item.product.image"
                  :src="item.product.image"
                  :alt="item.product.name"
                  class="w-24 h-24 object-cover rounded-lg"
                />
                <div v-else class="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>

              <!-- Информация о товаре -->
              <div class="flex-1">
                <h3 class="font-semibold text-text mb-2">{{ item.product.name }}</h3>

                <div class="flex items-center gap-2 mb-2">
                  <span
                    v-if="item.product.ralColor"
                    class="inline-flex items-center gap-2 text-xs text-gray-600"
                  >
                    <span
                      class="w-4 h-4 rounded border border-gray-300"
                      :style="{ backgroundColor: item.product.ralColorHex }"
                    ></span>
                    {{ item.product.ralColor }}
                  </span>
                </div>

                <div class="text-sm text-gray-600">
                  <span
                    :class="[
                      'inline-block px-2 py-1 rounded text-xs',
                      item.isFromStock
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800',
                    ]"
                  >
                    {{ item.isFromStock ? 'Со склада' : 'Под заказ' }}
                  </span>
                </div>
              </div>

              <!-- Количество и цена -->
              <div class="flex flex-col items-end justify-between">
                <div class="text-right">
                  <div class="text-lg font-semibold text-text">
                    {{ formatPrice(item.price * item.quantity) }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ formatPrice(item.price) }} × {{ item.quantity }} шт.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Итого -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <div class="flex justify-between items-center">
              <span class="text-xl font-semibold text-text">Итого:</span>
              <span class="text-2xl font-bold text-primary">{{ formatPrice(order.total) }}</span>
            </div>
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
