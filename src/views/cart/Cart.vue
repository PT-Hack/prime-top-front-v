<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { CartItem } from '@/types/cart.types'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { cartApi } from '@/services/api/cart.api'
import { ordersApi } from '@/services/api/orders.api'
import { formatters } from '@/utils/formatters'
import MainLayout from '@/components/layout/MainLayout.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppLoader from '@/components/common/AppLoader.vue'

const router = useRouter()
const { currentUser, hasCompany } = useAuth()
const { showToast } = useToast()

const loading = ref(false)
const cartItems = ref<CartItem[]>([])
const creatingOrder = ref(false)

const cartTotal = computed(() => {
  // В реальном приложении здесь будет расчет стоимости на основе серий
  // Пока возвращаем 0, так как в сериях нет поля price
  return 0
})

const loadCart = async () => {
  if (!currentUser.value) return

  loading.value = true
  try {
    cartItems.value = await cartApi.getCart(currentUser.value.id)
  } catch (error) {
    console.error('Ошибка загрузки корзины:', error)
    showToast('Не удалось загрузить корзину', 'error')
  } finally {
    loading.value = false
  }
}

const updateQuantity = async (item: CartItem, newQuantity: number) => {
  if (!currentUser.value || newQuantity < 1) return

  try {
    await cartApi.updateCartItem(currentUser.value.id, item.id, newQuantity)
    item.quantity = newQuantity
  } catch (error) {
    showToast(error instanceof Error ? error.message : 'Ошибка обновления', 'error')
  }
}

const removeItem = async (itemId: string) => {
  if (!currentUser.value) return

  try {
    cartItems.value = await cartApi.removeFromCart(currentUser.value.id, itemId)
    showToast('Товар удалён из корзины', 'success')
  } catch (error) {
    showToast('Не удалось удалить товар', 'error')
  }
}

const createOrder = async () => {
  if (!currentUser.value || !hasCompany.value || !currentUser.value.company_id) {
    showToast('Создайте компанию для оформления заказа', 'warning')
    return
  }

  if (cartItems.value.length === 0) {
    showToast('Корзина пуста', 'warning')
    return
  }

  creatingOrder.value = true
  try {
    const order = await ordersApi.createOrder({
      company_id: currentUser.value.company_id,
      user_id: currentUser.value.id,
      series: cartItems.value.map(item => ({
        id: Number(item.seriesId),
        amount: item.quantity
      }))
    })

    await cartApi.clearCart(currentUser.value.id)
    showToast('Заказ успешно создан!', 'success')
    router.push(`/orders/${order.id}`)
  } catch (error) {
    showToast(error instanceof Error ? error.message : 'Не удалось создать заказ', 'error')
  } finally {
    creatingOrder.value = false
  }
}

onMounted(() => {
  loadCart()
})
</script>

<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-6">
      <h1 class="text-3xl font-bold text-text mb-6">Корзина</h1>

      <div v-if="loading" class="flex justify-center py-20">
        <AppLoader size="lg" />
      </div>

      <div v-else-if="cartItems.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-4">
          <div v-for="item in cartItems" :key="item.id" class="bg-white rounded-lg border border-gray-400 p-4">
            <div class="flex gap-4">
              <div class="w-20 h-20 bg-gray-200 rounded flex-shrink-0"></div>
              <div class="flex-1">
                <h3 class="font-medium text-text mb-1">{{ item.series.title || 'Серия без названия' }}</h3>
                <p class="text-sm text-gray-600">ID серии: {{ item.seriesId }}</p>
                <p v-if="item.series.amount !== null && item.series.amount !== undefined" class="text-sm text-gray-600">
                  Доступно: {{ formatters.number(item.series.amount) }} кг
                </p>
              </div>
              <div class="flex flex-col items-end gap-2">
                <div class="flex items-center gap-2">
                  <button @click="updateQuantity(item, item.quantity - 1)" :disabled="item.quantity <= 1" class="w-8 h-8 border rounded hover:bg-gray-100 disabled:opacity-50">-</button>
                  <span class="w-16 text-center font-medium">{{ item.quantity }} кг</span>
                  <button @click="updateQuantity(item, item.quantity + 1)" :disabled="item.series.amount !== null && item.series.amount !== undefined && item.quantity >= item.series.amount" class="w-8 h-8 border rounded hover:bg-gray-100 disabled:opacity-50">+</button>
                </div>
                <button @click="removeItem(item.id)" class="text-sm text-error hover:underline">Удалить</button>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg border border-gray-400 p-6 sticky top-6">
            <h2 class="text-xl font-bold mb-4">Итого</h2>
            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-gray-600">
                <span>Товаров:</span>
                <span>{{ cartItems.length }}</span>
              </div>
              <div class="flex justify-between text-xl font-bold">
                <span>Сумма:</span>
                <span>{{ cartTotal.toLocaleString('ru-RU') }} ₽</span>
              </div>
            </div>
            <AppButton variant="primary" :full-width="true" @click="createOrder" :loading="creatingOrder" :disabled="!hasCompany">
              Оформить заказ
            </AppButton>
            <p v-if="!hasCompany" class="text-sm text-error mt-2 text-center">Создайте компанию для оформления заказа</p>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <svg class="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="text-xl font-medium text-gray-600 mb-2">Корзина пуста</h3>
        <p class="text-gray-500 mb-6">Добавьте товары из каталога</p>
        <AppButton variant="primary" @click="router.push('/products')">Перейти в каталог</AppButton>
      </div>
    </div>
  </MainLayout>
</template>
