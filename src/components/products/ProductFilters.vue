<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ProductFilters } from '@/types/product.types'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'

interface Props {
  modelValue: ProductFilters
  availableCategories?: string[]
  availableColors?: Array<{ code: string; hex: string }>
}

interface Emits {
  (e: 'update:modelValue', value: ProductFilters): void
  (e: 'apply'): void
}

const props = withDefaults(defineProps<Props>(), {
  availableCategories: () => ['ЛПЭЭ', 'ПЭФ'],
  availableColors: () => [
    { code: 'RAL 1013', hex: '#EAE6CA' },
    { code: 'RAL 1014', hex: '#E1CC4F' },
    { code: 'RAL 3020', hex: '#CC0605' },
    { code: 'RAL 5015', hex: '#2271B3' },
    { code: 'RAL 6018', hex: '#57A639' },
    { code: 'RAL 7035', hex: '#D7D7D7' },
    { code: 'RAL 9003', hex: '#F4F4F4' },
    { code: 'RAL 9005', hex: '#0A0A0A' },
  ],
})

const emit = defineEmits<Emits>()

const localFilters = ref<ProductFilters>({
  search: '',
  categories: [],
  ralColors: [],
  inStock: false,
  sortBy: 'name',
  sortOrder: 'asc',
  ...props.modelValue,
})
const showFilters = ref(false)

// Синхронизация локальных фильтров с props
watch(
  () => props.modelValue,
  (newVal) => {
    localFilters.value = {
      search: '',
      categories: [],
      ralColors: [],
      inStock: false,
      sortBy: 'name',
      sortOrder: 'asc',
      ...newVal,
    }
  },
  { deep: true }
)

const updateFilters = () => {
  emit('update:modelValue', { ...localFilters.value })
  emit('apply')
}

const toggleCategory = (category: string) => {
  if (!localFilters.value.categories) {
    localFilters.value.categories = []
  }

  const index = localFilters.value.categories.indexOf(category)
  if (index > -1) {
    localFilters.value.categories.splice(index, 1)
  } else {
    localFilters.value.categories.push(category)
  }

  updateFilters()
}

const toggleColor = (color: string) => {
  if (!localFilters.value.ralColors) {
    localFilters.value.ralColors = []
  }

  const index = localFilters.value.ralColors.indexOf(color)
  if (index > -1) {
    localFilters.value.ralColors.splice(index, 1)
  } else {
    localFilters.value.ralColors.push(color)
  }

  updateFilters()
}

const clearFilters = () => {
  localFilters.value = {
    search: '',
    categories: [],
    ralColors: [],
    inStock: false,
    sortBy: 'name',
    sortOrder: 'asc',
  }
  updateFilters()
}

const hasActiveFilters = computed(() => {
  return (
    !!localFilters.value.search ||
    (localFilters.value.categories && localFilters.value.categories.length > 0) ||
    (localFilters.value.ralColors && localFilters.value.ralColors.length > 0) ||
    localFilters.value.inStock
  )
})
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-400 p-4">
    <!-- Заголовок и кнопка сворачивания (для мобильных) -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-text">Фильтры</h3>
      <button
        class="md:hidden text-primary hover:text-primary-600"
        @click="showFilters = !showFilters"
      >
        <svg
          class="w-6 h-6 transition-transform"
          :class="{ 'rotate-180': showFilters }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    <div :class="{ 'hidden md:block': !showFilters }" class="space-y-6">
      <!-- Поиск -->
      <div>
        <AppInput
          v-model="localFilters.search!"
          type="text"
          placeholder="Поиск по названию или цвету..."
          @input="updateFilters"
        />
      </div>

      <!-- Только в наличии -->
      <div>
        <label class="flex items-center cursor-pointer">
          <input
            v-model="localFilters.inStock"
            type="checkbox"
            class="w-5 h-5 text-primary rounded focus:ring-primary mr-3"
            @change="updateFilters"
          />
          <span class="text-sm text-text font-medium">Только в наличии</span>
        </label>
      </div>

      <!-- Категории -->
      <div>
        <h4 class="text-sm font-semibold text-text mb-3">Категории</h4>
        <div class="space-y-2">
          <label
            v-for="category in availableCategories"
            :key="category"
            class="flex items-center cursor-pointer"
          >
            <input
              type="checkbox"
              :checked="localFilters.categories?.includes(category)"
              class="w-4 h-4 text-primary rounded focus:ring-primary mr-2"
              @change="toggleCategory(category)"
            />
            <span class="text-sm text-gray-700">{{ category }}</span>
          </label>
        </div>
      </div>

      <!-- Цвета RAL -->
      <div>
        <h4 class="text-sm font-semibold text-text mb-3">Цвета RAL</h4>
        <div class="space-y-2">
          <label
            v-for="color in availableColors"
            :key="color.code"
            class="flex items-center cursor-pointer"
          >
            <input
              type="checkbox"
              :checked="localFilters.ralColors?.includes(color.code)"
              class="w-4 h-4 text-primary rounded focus:ring-primary mr-2"
              @change="toggleColor(color.code)"
            />
            <div
              class="w-5 h-5 rounded border border-gray-400 mr-2"
              :style="{ backgroundColor: color.hex }"
            ></div>
            <span class="text-sm text-gray-700">{{ color.code }}</span>
          </label>
        </div>
      </div>

      <!-- Сортировка -->
      <div>
        <h4 class="text-sm font-semibold text-text mb-3">Сортировка</h4>
        <div class="space-y-2">
          <select
            v-model="localFilters.sortBy"
            class="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            @change="updateFilters"
          >
            <option value="name">По названию</option>
            <option value="price">По цене</option>
            <option value="stock">По остатку</option>
          </select>

          <select
            v-model="localFilters.sortOrder"
            class="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            @change="updateFilters"
          >
            <option value="asc">По возрастанию</option>
            <option value="desc">По убыванию</option>
          </select>
        </div>
      </div>

      <!-- Кнопка очистки фильтров -->
      <div v-if="hasActiveFilters">
        <AppButton variant="outline" :full-width="true" @click="clearFilters">
          Сбросить фильтры
        </AppButton>
      </div>
    </div>
  </div>
</template>
