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
const selectedSeries = ref<string | null>(null)
const colorPreviewVisible = ref(false)

const productId = computed(() => route.params.id as string)

// Первая доступная серия
const firstSeries = computed(() => {
  if (!product.value?.series || product.value.series.length === 0) return null
  return product.value.series[0]
})

// Можно ли добавить в корзину
const canAddToCart = computed(() => {
  return hasCompany.value && product.value && firstSeries.value && (firstSeries.value.amount || 0) > 0
})


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
  if (!currentUser.value || !product.value || !selectedSeries.value) return

  const series = product.value.series?.find(s => String(s.id) === selectedSeries.value)
  if (!series) {
    showToast('Выберите серию', 'error')
    return
  }

  if (quantity.value <= 0) {
    showToast('Укажите количество', 'error')
    return
  }

  if (series.amount !== null && series.amount !== undefined && quantity.value > series.amount) {
    showToast(`Доступно только ${series.amount} кг`, 'error')
    return
  }

  addingToCart.value = true

  try {
    await cartApi.addToCart(currentUser.value.id, selectedSeries.value, quantity.value)
    showToast('Товар добавлен в корзину', 'success')
    quantity.value = 1
  } catch (error: unknown) {
    console.error('Ошибка добавления в корзину:', error)
    showToast((error instanceof Error ? error.message : 'Ошибка добавления в корзину'), 'error')
  } finally {
    addingToCart.value = false
  }
}

// Вернуться к списку
const goBack = () => {
  router.push('/products')
}

onMounted(() => {
  loadProduct().then(() => {
    if (firstSeries.value) {
      selectedSeries.value = String(firstSeries.value.id)
    }
  })
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
            <div class="aspect-square overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
              <img src="@/assets/vedra2.png" alt="Изображение товара" class="w-full h-full object-cover">
            </div>
          </AppCard>

          <!-- Информация и действия -->
          <div class="space-y-4">
            <AppCard>
              <div class="space-y-4">
                <!-- Заголовок -->
                <div>
                  <h1 class="text-3xl font-bold text-text mb-2">{{ product.nomenclature }}</h1>
                  <p v-if="product.client" class="text-gray-600">Клиент: {{ product.client }}</p>
                </div>

                <!-- Информация о цвете -->
                <div v-if="product.color_hex || product.color_name || product.color_ral_code" class="space-y-2">
                  <div class="flex items-center gap-3">
                    <span class="text-gray-600">Цвет:</span>
                    <div v-if="product.color_hex" @click="colorPreviewVisible = true"
                      class="flex cursor-pointer items-center gap-2 hover:opacity-80 transition-opacity">
                      <div class="w-10 h-10 rounded border-2 border-gray-300 shadow-sm"
                        :style="{ backgroundColor: product.color_hex }"
                        :title="product.color_name || product.color_ral_code || 'Цвет'"></div>
                      <span class="font-semibold">
                        <span v-if="product.color_ral_code">RAL {{ product.color_ral_code }}</span>
                        <span v-if="product.color_name" class="ml-1">({{ product.color_name }})</span>
                      </span>
                    </div>
                    <span v-else-if="product.color_ral_code" class="font-semibold">RAL {{ product.color_ral_code
                    }}</span>
                    <span v-else-if="product.color_name" class="font-semibold">{{ product.color_name }}</span>
                  </div>
                </div>

                <!-- Названия серий -->
                <div v-if="product.series && product.series.length > 0" class="space-y-1">
                  <span class="text-gray-600 text-sm">Доступные серии:</span>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="series in product.series" :key="series.id"
                      class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {{ series.title || `Серия #${series.id}` }}
                    </span>
                  </div>
                </div>

                <!-- Серии -->
                <div v-if="product.series && product.series.length > 0" class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Выберите серию
                    </label>
                    <select v-model="selectedSeries"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                      <option v-for="series in product.series" :key="series.id" :value="String(series.id)">
                        {{ series.title || `Серия #${series.id}` }}
                        <span v-if="series.amount !== null && series.amount !== undefined">
                          ({{ series.amount }} кг)
                        </span>
                      </option>
                    </select>
                  </div>

                  <!-- Информация о выбранной серии -->
                  <div v-if="selectedSeries" class="p-3 bg-gray-50 rounded-lg">
                    <div v-for="series in product.series" :key="series.id">
                      <template v-if="String(series.id) === selectedSeries">
                        <div class="space-y-2 text-sm">
                          <div v-if="series.amount !== null && series.amount !== undefined">
                            <span class="text-gray-600">В наличии:</span>
                            <span class="font-semibold ml-2">{{ series.amount }} кг</span>
                          </div>
                          <div v-if="series.title">
                            <span class="text-gray-600">Название:</span>
                            <span class="font-semibold ml-2">{{ series.title }}</span>
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500">
                  Нет доступных серий
                </div>

                <!-- Добавление в корзину (только для пользователей компаний) -->
                <div v-if="canAddToCart && selectedSeries" class="border-t pt-4 mt-4">
                  <div class="space-y-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Количество (кг)
                      </label>
                      <input v-model.number="quantity" type="number" min="1"
                        :max="product.series?.find(s => String(s.id) === selectedSeries)?.amount || 999999"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <AppButton variant="primary" size="lg" full-width :loading="addingToCart" @click="handleAddToCart">
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

        <!-- Список серий -->
        <AppCard v-if="product.series && product.series.length > 0">
          <h2 class="text-2xl font-semibold text-text mb-4">Серии ({{ product.series.length }})</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="series in product.series" :key="series.id"
              class="p-4 border border-gray-300 rounded-lg hover:shadow-md transition-shadow">
              <h3 class="font-semibold text-text mb-2">{{ series.title || `Серия #${series.id}` }}</h3>
              <div class="space-y-1 text-sm text-gray-600">
                <div v-if="series.amount !== null && series.amount !== undefined">
                  <span class="font-medium">Количество:</span> {{ series.amount }} кг
                </div>
                <div v-if="series.shine_heated !== null && series.shine_heated !== undefined">
                  <span class="font-medium">Блеск нагретый:</span> {{ series.shine_heated }}
                </div>
                <div v-if="series.conditional_viscosity !== null && series.conditional_viscosity !== undefined">
                  <span class="font-medium">Условная вязкость:</span> {{ series.conditional_viscosity }}
                </div>
                <div v-if="series.appearance">
                  <span class="font-medium">Внешний вид:</span> {{ series.appearance }}
                </div>
              </div>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Товар не найден -->
      <AppCard v-else class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p class="text-lg text-gray-600 mb-4">Товар не найден</p>
        <AppButton variant="primary" @click="goBack"> Вернуться к каталогу </AppButton>
      </AppCard>

      <!-- Dialog для превью цвета -->
      <Dialog v-model:visible="colorPreviewVisible" :modal="true" :draggable="false"
        class="bg-white border border-gray-300 rounded-2xl p-4" :style="{ width: '90vw', maxWidth: '800px' }"
        header="Предпросмотр цвета">
        <template v-if="product?.color_hex">
          <ColorPreview :color="product.color_hex" texture-type="wood" />
        </template>
        <template v-else>
          <div class="text-center py-8 text-gray-500">
            Цвет не указан
          </div>
        </template>
      </Dialog>
    </div>
  </MainLayout>
</template>

<style>
.p-dialog-header {
  display: flex;
  justify-content: space-between;
}
</style>
