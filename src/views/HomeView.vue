<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productsApi } from '@/services/api/products.api'
import type { Product } from '@/types/product.types'
import MainLayout from '@/components/layout/MainLayout.vue'
import ProductCard from '@/components/products/ProductCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppLoader from '@/components/common/AppLoader.vue'

const router = useRouter()

const products = ref<Product[]>([])
const loading = ref(false)

const goToProducts = () => router.push('/products')

onMounted(async () => {
  loading.value = true
  try {
    // Загружаем только товары в наличии для главной страницы (остатки)
    const response = await productsApi.getProducts({ inStock: true })
    products.value = response.products.slice(0, 12) // Берем первые 12
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-6">
      <!-- Блок промоакций -->
      <section class="mb-8">
        <div class="bg-[#054787] rounded-2xl p-8 md:p-12 text-white overflow-hidden relative">
          <div class="relative z-10 max-w-2xl">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">
              Специальное предложение на остатки!
            </h2>
            <p class="text-lg mb-6">
              Скидки до 30% на лакокрасочные материалы в наличии.<br />
              Быстрая отгрузка и выгодные условия для оптовых покупателей.
            </p>
            <AppButton variant="secondary" size="lg" @click="goToProducts">
              Посмотреть остатки
            </AppButton>
          </div>
          <!-- Изображения продуктов -->
          <div class="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 gap-4 opacity-90">
            <img src="@/assets/vedro1.png" alt="Ведро краски 1" class="h-40 object-contain drop-shadow-lg" />
            <img src="@/assets/vedra2.png" alt="Ведро краски 2" class="h-48 object-contain drop-shadow-lg" />
            <img src="@/assets/vedra3.png" alt="Ведро краски 3" class="h-40 object-contain drop-shadow-lg" />
          </div>
        </div>
      </section>

      <!-- Заголовок секции товаров -->
      <section>
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-text">Остатки на складе</h2>
            <p class="text-sm text-gray-600 mt-1">Доступно для немедленной отгрузки</p>
          </div>
          <AppButton variant="outline" @click="goToProducts">
            Все товары
          </AppButton>
        </div>

        <!-- Загрузка -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <AppLoader size="lg" />
        </div>

        <!-- Карточки товаров из остатков -->
        <div v-else-if="products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
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
          <h3 class="text-xl font-medium text-gray-600 mb-2">Товары временно отсутствуют</h3>
          <p class="text-gray-500">Попробуйте зайти позже</p>
        </div>
      </section>
    </div>
  </MainLayout>
</template>
