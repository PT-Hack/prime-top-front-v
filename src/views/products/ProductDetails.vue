<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Product } from '@/types/product.types'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { productsApi } from '@/services/api/products.api'
import { cartApi } from '@/services/api/cart.api'
import MainLayout from '@/components/layout/MainLayout.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import Dialog from 'primevue/dialog'
import ColorPreview from './ColorPreview.vue'
const router = useRouter()
const route = useRoute()
const { currentUser, hasCompany } = useAuth()
const { showToast } = useToast()

const loading = ref(false)
const product = ref<Product | null>(null)
const quantity = ref(1)
const addingToCart = ref(false)

const colorPreviewVisible = ref(false)
const productId = computed(() => route.params.id as string)

// Можно ли добавить в корзину
const canAddToCart = computed(() => {
  return hasCompany.value && product.value && product.value.isInStock
})

// Форматирование цены
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(price)
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

// Загрузка товара
const loadProduct = async () => {
  loading.value = true

  try {
    product.value = await productsApi.getProductById(productId.value)

    if (!product.value) {
      showToast('Товар не найден', 'error')
      router.push('/products')
    }
  } catch (error) {
    console.error('Ошибка загрузки товара:', error)
    showToast('Ошибка загрузки товара', 'error')
  } finally {
    loading.value = false
  }
}

// Добавить в корзину
const handleAddToCart = async () => {
  if (!currentUser.value || !product.value) return

  if (quantity.value <= 0) {
    showToast('Укажите количество', 'error')
    return
  }

  if (quantity.value > product.value.stock) {
    showToast(`Доступно только ${product.value.stock} кг`, 'error')
    return
  }

  addingToCart.value = true

  try {
    await cartApi.addToCart(currentUser.value.id, product.value.id, quantity.value)
    showToast('Товар добавлен в корзину', 'success')
    quantity.value = 1
  } catch (error: any) {
    console.error('Ошибка добавления в корзину:', error)
    showToast(error.message || 'Ошибка добавления в корзину', 'error')
  } finally {
    addingToCart.value = false
  }
}

// Вернуться к списку
const goBack = () => {
  router.push('/products')
}

onMounted(() => {
  loadProduct()
})
</script>

<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-6">
      <!-- Загрузка -->
      <AppLoader v-if="loading" class="py-12" />

      <!-- Контент товара -->
      <div v-else-if="product" class="space-y-6">
        <!-- Навигация назад -->
        <div class="mb-4">
          <AppButton variant="outline" size="sm" @click="goBack">
            ← Вернуться к каталогу
          </AppButton>
        </div>

        <!-- Основная информация -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Изображение -->
          <AppCard>
            <div class="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img :src="product.image" :alt="product.name" class="w-full h-full object-cover" />
            </div>
          </AppCard>

          <!-- Информация и действия -->
          <div class="space-y-4">
            <AppCard>
              <div class="space-y-4">
                <!-- Заголовок -->
                <div>
                  <h1 class="text-3xl font-bold text-text mb-2">{{ product.name }}</h1>
                  <p class="text-gray-600">{{ product.nomenclatureName }}</p>
                </div>

                <!-- Цена и наличие -->
                <div class="flex items-center gap-4">
                  <div class="text-3xl font-bold text-primary">
                    {{ formatPrice(product.price) }}
                  </div>
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-sm font-medium',
                      product.isInStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                    ]"
                  >
                    {{ product.isInStock ? 'В наличии' : 'Нет в наличии' }}
                  </span>
                  <span
                    v-if="product.isPromotion"
                    class="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800"
                  >
                    Акция
                  </span>
                </div>

                <!-- Наличие на складе -->
                <div v-if="product.isInStock" class="text-sm text-gray-600">
                  На складе: <span class="font-semibold">{{ product.stock }} кг</span>
                </div>
                <Dialog
                  draggable="false"
                  class="bg-white border-1 border-black w-1/2 text-black rounded-2xl p-4"
                  header="Предпросмотр цвета"
                  v-model:visible="colorPreviewVisible"
                >
                  <ColorPreview :color="product.ralColorHex" />
                </Dialog>
                <!-- RAL цвет -->
                <div class="flex items-center gap-3">
                  <span class="text-gray-600">RAL цвет:</span>
                  <div
                    @click="colorPreviewVisible = true"
                    class="flex cursor-pointer items-center gap-2"
                  >
                    <div
                      class="w-8 h-8 rounded border border-gray-300"
                      :style="{ backgroundColor: product.ralColorHex }"
                    ></div>
                    <span class="font-semibold">{{ product.ralColor }}</span>
                  </div>
                </div>

                <!-- Категория -->
                <div class="flex items-center gap-3">
                  <span class="text-gray-600">Категория:</span>
                  <span class="font-semibold">{{ product.category }}</span>
                </div>

                <!-- Расчетная доставка -->
                <div v-if="product.estimatedDelivery" class="flex items-center gap-3">
                  <span class="text-gray-600">Расчетная доставка:</span>
                  <span class="font-semibold">{{ product.estimatedDelivery }}</span>
                </div>

                <!-- Добавление в корзину (только для пользователей компаний) -->
                <div v-if="canAddToCart" class="border-t pt-4 mt-4">
                  <div class="space-y-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Количество (кг)
                      </label>
                      <input
                        v-model.number="quantity"
                        type="number"
                        min="1"
                        :max="product.stock"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <AppButton
                      variant="primary"
                      size="lg"
                      full-width
                      :loading="addingToCart"
                      @click="handleAddToCart"
                    >
                      Добавить в корзину
                    </AppButton>
                  </div>
                </div>

                <!-- Сообщение для неавторизованных -->
                <div v-else-if="!currentUser" class="border-t pt-4 mt-4">
                  <p class="text-sm text-gray-600 text-center">
                    Войдите в систему, чтобы добавить товар в корзину
                  </p>
                </div>

                <!-- Сообщение для пользователей без компании -->
                <div v-else-if="!hasCompany" class="border-t pt-4 mt-4">
                  <p class="text-sm text-gray-600 text-center">
                    Присоединитесь к компании, чтобы делать заказы
                  </p>
                </div>
              </div>
            </AppCard>
          </div>
        </div>

        <!-- Описание -->
        <AppCard v-if="product.description">
          <h2 class="text-2xl font-semibold text-text mb-4">Описание</h2>
          <p class="text-gray-700 whitespace-pre-wrap">{{ product.description }}</p>
        </AppCard>

        <!-- Информация о партии -->
        <AppCard v-if="product.batchInfo">
          <h2 class="text-2xl font-semibold text-text mb-4">Информация о партии</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div class="text-sm text-gray-600 mb-1">Номер партии</div>
              <div class="font-semibold">{{ product.batchInfo.batchNumber }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600 mb-1">Дата производства</div>
              <div class="font-semibold">{{ formatDate(product.batchInfo.productionDate) }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600 mb-1">Срок годности</div>
              <div class="font-semibold">{{ formatDate(product.batchInfo.expiryDate) }}</div>
            </div>
          </div>
        </AppCard>

        <!-- Результаты анализа -->
        <AppCard v-if="product.analysisResults">
          <h2 class="text-2xl font-semibold text-text mb-4">Результаты анализа</h2>

          <div class="space-y-4">
            <!-- Качество -->
            <div>
              <div class="text-sm text-gray-600 mb-1">Качество</div>
              <div class="font-semibold">{{ product.analysisResults.quality }}</div>
            </div>

            <!-- Состав -->
            <div>
              <div class="text-sm text-gray-600 mb-2">Состав</div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div
                  v-for="(value, key) in product.analysisResults.composition"
                  :key="key"
                  class="flex justify-between p-2 bg-gray-50 rounded"
                >
                  <span>{{ key }}</span>
                  <span class="font-semibold">{{ value }}</span>
                </div>
              </div>
            </div>

            <!-- Сертификаты -->
            <div v-if="product.analysisResults.certificates.length > 0">
              <div class="text-sm text-gray-600 mb-2">Сертификаты</div>
              <ul class="list-disc list-inside space-y-1">
                <li
                  v-for="(cert, index) in product.analysisResults.certificates"
                  :key="index"
                  class="text-gray-700"
                >
                  {{ cert }}
                </li>
              </ul>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Товар не найден -->
      <AppCard v-else class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <p class="text-lg text-gray-600 mb-4">Товар не найден</p>
        <AppButton variant="primary" @click="goBack"> Вернуться к каталогу </AppButton>
      </AppCard>
    </div>
  </MainLayout>
</template>

<style>
.p-dialog-header {
  display: flex;
  justify-content: space-between;
}
</style>
