<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Product, ProductFilters } from '@/types/product.types'
import { productsApi } from '@/services/api/products.api'
import { usePagination } from '@/composables/usePagination'
import MainLayout from '@/components/layout/MainLayout.vue'
import ProductCard from '@/components/products/ProductCard.vue'
import ProductFiltersComponent from '@/components/products/ProductFilters.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppButton from '@/components/common/AppButton.vue'

const loading = ref(false)
const products = ref<Product[]>([])
const totalProducts = ref(0)

const filters = ref<ProductFilters>({
  search: '',
  categories: [],
  ralColors: [],
  inStock: false,
  sortBy: 'name',
  sortOrder: 'asc',
})

const { page, perPage, totalPages, goToPage, nextPage, prevPage, hasPrevPage, hasNextPage } =
  usePagination(totalProducts, 12)

const loadProducts = async () => {
  loading.value = true

  try {
    const response = await productsApi.getProducts(filters.value)
    products.value = response.products
    totalProducts.value = response.total
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error)
  } finally {
    loading.value = false
  }
}

// Пагинация на клиенте (т.к. API возвращает все отфильтрованные товары)
const paginatedProducts = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return products.value.slice(start, end)
})

const handleFiltersChange = () => {
  page.value = 1 // Сбрасываем на первую страницу при изменении фильтров
  loadProducts()
}

// Проверка, есть ли активные фильтры
const hasActiveFilters = computed(() => {
  return (
    !!filters.value.search ||
    (filters.value.categories && filters.value.categories.length > 0) ||
    (filters.value.ralColors && filters.value.ralColors.length > 0) ||
    filters.value.inStock
  )
})

onMounted(() => {
  loadProducts()
})
</script>

<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-6">
      <!-- Заголовок -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-text">Каталог товаров)</h1>
        <p class="text-gray-600 mt-1">
          {{ totalProducts }} {{ totalProducts === 1 ? 'товар' : 'товаров' }}
          <span v-if="hasActiveFilters" class="text-primary font-medium">
            (применены фильтры)
          </span>
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Боковая панель с фильтрами -->
        <aside class="lg:col-span-1">
          <ProductFiltersComponent v-model="filters" @apply="handleFiltersChange" />
        </aside>

        <!-- Основной контент с товарами -->
        <main class="lg:col-span-3">
          <!-- Загрузка -->
          <div v-if="loading" class="flex justify-center items-center py-20">
            <AppLoader size="lg" />
          </div>

          <!-- Список товаров -->
          <div v-else-if="paginatedProducts.length > 0">
            <!-- Grid товаров -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <ProductCard v-for="product in paginatedProducts" :key="product.id" :product="product" />
            </div>

            <!-- Пагинация -->
            <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
              <AppButton
                variant="outline"
                size="sm"
                @click="prevPage"
                :disabled="!hasPrevPage"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </AppButton>

              <template v-for="pageNum in totalPages" :key="pageNum">
                <AppButton
                  v-if="
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - page) <= 2
                  "
                  :variant="pageNum === page ? 'primary' : 'outline'"
                  size="sm"
                  @click="goToPage(pageNum)"
                >
                  {{ pageNum }}
                </AppButton>
                <span
                  v-else-if="
                    (pageNum === 2 && page > 4) ||
                    (pageNum === totalPages - 1 && page < totalPages - 3)
                  "
                  class="text-gray-600"
                >
                  ...
                </span>
              </template>

              <AppButton
                variant="outline"
                size="sm"
                @click="nextPage"
                :disabled="!hasNextPage"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </AppButton>
            </div>
          </div>

          <!-- Пустое состояние -->
          <div v-else class="text-center py-20">
            <svg class="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 class="text-xl font-medium text-gray-600 mb-2">Товары не найдены</h3>
            <p class="text-gray-500">
              {{ hasActiveFilters ? 'Попробуйте изменить фильтры' : 'Товары временно отсутствуют' }}
            </p>
          </div>
        </main>
      </div>
    </div>
  </MainLayout>
</template>
