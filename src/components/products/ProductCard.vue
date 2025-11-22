<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Product, Series } from '@/types/product.types'
import { useAuth } from '@/composables/useAuth'
import { usePermissions } from '@/composables/usePermissions'
import { useToast } from '@/composables/useToast'
import { favoritesApi } from '@/services/api/favorites.api'
import { cartApi } from '@/services/api/cart.api'

interface Props {
  product: Product
}

const props = defineProps<Props>()
const router = useRouter()
const { currentUser } = useAuth()
const { canAddToFavorites, canAddToCart } = usePermissions()
const { showToast } = useToast()

const isFavorite = ref(false)
const favoriteLoading = ref(false)
const addingToCart = ref(false)
const selectedSeries = ref<Series | null>(null)

// Первая доступная серия или первая серия
const firstSeries = computed(() => {
  if (!props.product.series || props.product.series.length === 0) return null
  return props.product.series[0]
})

// Инициализация выбранной серии
onMounted(() => {
  selectedSeries.value = firstSeries.value || null
  if (currentUser.value && canAddToFavorites.value) {
    checkFavorite()
  }
})

const checkFavorite = async () => {
  try {
    isFavorite.value = await favoritesApi.isFavorite(currentUser.value!.id, props.product.id)
  } catch (error) {
    console.error('Ошибка проверки избранного:', error)
  }
}

const goToProduct = () => {
  router.push(`/products/${props.product.id}`)
}

const formatAmount = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return 'Нет данных'
  return `${amount.toLocaleString('ru-RU')} кг`
}

const toggleFavorite = async (event: Event) => {
  event.stopPropagation()

  if (!currentUser.value || !canAddToFavorites.value) {
    showToast('Войдите в систему, чтобы добавить товар в избранное', 'warning')
    return
  }

  favoriteLoading.value = true

  try {
    const newState = await favoritesApi.toggleFavorite(currentUser.value.id, props.product.id)
    isFavorite.value = newState

    showToast(
      newState ? 'Товар добавлен в избранное' : 'Товар удалён из избранного',
      'success'
    )
  } catch (error) {
    console.error('Ошибка изменения избранного:', error)
    showToast('Не удалось изменить избранное', 'error')
  } finally {
    favoriteLoading.value = false
  }
}

const addSeriesToCart = async (event: Event) => {
  event.stopPropagation()

  if (!currentUser.value || !canAddToCart.value) {
    showToast('Войдите в систему для добавления в корзину', 'warning')
    return
  }

  if (!selectedSeries.value) {
    showToast('Выберите серию для добавления в корзину', 'warning')
    return
  }

  addingToCart.value = true

  try {
    await cartApi.addToCart(currentUser.value.id, String(selectedSeries.value.id), 1)
    showToast('Товар добавлен в корзину', 'success')
  } catch (error) {
    showToast(error instanceof Error ? error.message : 'Не удалось добавить товар', 'error')
  } finally {
    addingToCart.value = false
  }
}

const hasAvailableSeries = computed(() => {
  return props.product.series && props.product.series.some(s => (s.amount || 0) > 0)
})
</script>

<template>
  <div
    class="bg-white rounded-lg border border-gray-400 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
    @click="goToProduct"
  >
    <!-- Изображение товара -->
    <div class="relative bg-gray-200 aspect-square flex items-center justify-center">
      <!-- Кнопка избранного -->
      <button
        v-if="canAddToFavorites"
        @click="toggleFavorite"
        :disabled="favoriteLoading"
        class="absolute top-2 left-2 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 z-10"
        :class="{ 'text-error': isFavorite, 'text-gray-400': !isFavorite }"
        :title="isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'"
      >
        <svg class="w-5 h-5" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      <div v-else class="text-gray-500 text-center p-4">
        <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span class="text-xs">Нет изображения</span>
      </div>
    </div>

    <!-- Информация о товаре -->
    <div class="p-4">
      <!-- Название номенклатурное -->
      <h3 class="font-medium text-text text-sm mb-2 line-clamp-2 h-10">
        {{ product.nomenclature }}
      </h3>

      <!-- Клиент (если есть) -->
      <div v-if="product.client" class="flex items-center gap-2 mb-2">
        <span class="text-xs text-gray-600">Клиент:</span>
        <span class="text-xs font-medium">{{ product.client }}</span>
      </div>

      <!-- Серии -->
      <div v-if="product.series && product.series.length > 0" class="mb-2">
        <div v-if="product.series.length === 1" class="space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-600">Серия:</span>
            <span class="text-xs font-medium">{{ firstSeries?.title || 'Без названия' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-600">В наличии:</span>
            <span class="text-sm font-bold text-primary">
              {{ formatAmount(firstSeries?.amount) }}
            </span>
          </div>
        </div>
        <div v-else class="space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-600">Серий:</span>
            <span class="text-xs font-medium">{{ product.series.length }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-600">Доступно:</span>
            <span class="text-sm font-bold text-primary">
              {{ hasAvailableSeries ? 'Есть в наличии' : 'Нет в наличии' }}
            </span>
          </div>
        </div>
      </div>
      <div v-else class="text-xs text-gray-500 mb-2">
        Нет серий
      </div>

      <!-- Кнопка добавления в корзину -->
      <button
        v-if="canAddToCart && firstSeries"
        @click="addSeriesToCart"
        :disabled="addingToCart || !hasAvailableSeries"
        class="w-full mt-4 px-4 py-2 bg-[#054787] text-white rounded-lg hover:bg-[#0067cb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg v-if="!addingToCart" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span v-if="addingToCart">Добавление...</span>
        <span v-else-if="!hasAvailableSeries">Нет в наличии</span>
        <span v-else>В корзину</span>
      </button>
    </div>
  </div>
</template>
