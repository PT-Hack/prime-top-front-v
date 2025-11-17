<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Product } from '@/types/product.types'
import { useAuth } from '@/composables/useAuth'
import { favoritesApi } from '@/services/api/favorites.api'
import MainLayout from '@/components/layout/MainLayout.vue'
import ProductCard from '@/components/products/ProductCard.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppButton from '@/components/common/AppButton.vue'

const router = useRouter()
const { currentUser } = useAuth()

const loading = ref(false)
const favorites = ref<Product[]>([])

const loadFavorites = async () => {
  if (!currentUser.value) return

  loading.value = true

  try {
    favorites.value = await favoritesApi.getFavorites(currentUser.value.id)
  } catch (error) {
    console.error('Ошибка загрузки избранного:', error)
  } finally {
    loading.value = false
  }
}

const goToCatalog = () => {
  router.push('/products')
}

onMounted(() => {
  loadFavorites()
})
</script>

<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-6">
      <!-- Заголовок -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-text">Избранное</h1>
        <p class="text-gray-600 mt-1">
          {{ favorites.length }} {{ favorites.length === 1 ? 'товар' : 'товаров' }}
        </p>
      </div>

      <!-- Загрузка -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <AppLoader size="lg" />
      </div>

      <!-- Список избранных товаров -->
      <div v-else-if="favorites.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        <ProductCard v-for="product in favorites" :key="product.id" :product="product" />
      </div>

      <!-- Пустое состояние -->
      <div v-else class="text-center py-20">
        <svg class="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <h3 class="text-xl font-medium text-gray-600 mb-2">В избранном пока ничего нет</h3>
        <p class="text-gray-500 mb-6">Добавьте товары в избранное, чтобы не потерять их</p>
        <AppButton variant="primary" @click="goToCatalog">
          Перейти в каталог
        </AppButton>
      </div>
    </div>
  </MainLayout>
</template>
