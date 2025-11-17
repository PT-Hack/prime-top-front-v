<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { usePermissions } from '@/composables/usePermissions'
import { UserRole } from '@/types/auth.types'
import AppButton from '@/components/common/AppButton.vue'

const router = useRouter()
const { isAuthenticated, currentUser, logout } = useAuth()
const {
  canViewFavorites,
  canManageCart,
  canViewOrders,
  canViewCompany,
  canViewCompanies,
  canViewUsers,
} = usePermissions()

const showMobileMenu = ref(false)
const showUserMenu = ref(false)

const handleLogout = async () => {
  await logout()
  showUserMenu.value = false
  router.push('/login')
}

const menuItems = computed(() => {
  if (!isAuthenticated.value) return []

  const items = [
    { label: 'Товары', path: '/products', icon: 'box', show: true },
    { label: 'Избранное', path: '/favorites', icon: 'heart', show: canViewFavorites.value },
    { label: 'Профиль', path: '/profile', icon: 'user', show: true },
    { label: 'Сообщения', path: '/messages', icon: 'message', show: true },
    { label: 'Корзина', path: '/cart', icon: 'shopping-cart', show: canManageCart.value },
    { label: 'Заказы', path: '/orders', icon: 'file-text', show: canViewOrders.value },
    { label: 'Компания', path: '/company', icon: 'building', show: canViewCompany.value },
    {
      label: 'Список компаний',
      path: '/companies',
      icon: 'building-2',
      show: canViewCompanies.value,
    },
    { label: 'Пользователи', path: '/users', icon: 'users', show: canViewUsers.value },
  ]

  return items.filter((item) => item.show)
})

const isActive = (path: string) => {
  return router.currentRoute.value.path === path
}
</script>

<template>
  <header class="bg-white shadow-sm border-b border-gray-400 sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Логотип -->
        <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
          <div class="w-10 h-10 bg-[#054787] rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-xl">PT</span>
          </div>
          <div class="hidden md:block">
            <h1 class="text-xl font-bold text-[#054787]">Prime Top</h1>
            <p class="text-xs text-gray-600">B2B маркетплейс ЛКМ</p>
          </div>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-6">
          <template v-if="isAuthenticated">
            <router-link
              v-for="item in menuItems.slice(0, 5)"
              :key="item.path"
              :to="item.path"
              :class="[
                'text-sm font-medium transition-colors',
                isActive(item.path)
                  ? 'text-primary'
                  : 'text-gray-600 hover:text-primary',
              ]"
            >
              {{ item.label }}
            </router-link>

            <!-- Dropdown для остальных пунктов если их много -->
            <div v-if="menuItems.length > 5" class="relative">
              <button
                class="text-sm font-medium text-gray-600 hover:text-primary"
                @click="showUserMenu = !showUserMenu"
              >
                Ещё
              </button>
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-400 py-2"
              >
                <router-link
                  v-for="item in menuItems.slice(5)"
                  :key="item.path"
                  :to="item.path"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  {{ item.label }}
                </router-link>
              </div>
            </div>
          </template>
        </nav>

        <!-- User Actions -->
        <div class="flex items-center gap-4">
          <template v-if="isAuthenticated">
            <!-- User Menu -->
            <div class="relative hidden md:block">
              <button
                class="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary"
                @click="showUserMenu = !showUserMenu"
              >
                <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-primary font-medium text-sm">
                    {{ currentUser?.fullName.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <span class="max-w-32 truncate">{{ currentUser?.fullName }}</span>
              </button>

              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-400 py-2"
              >
                <div class="px-4 py-2 border-b border-gray-400">
                  <p class="text-sm font-medium text-gray-900">{{ currentUser?.fullName }}</p>
                  <p class="text-xs text-gray-600">{{ currentUser?.email }}</p>
                </div>
                <a
                  href="https://primetop.ru"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  О производителе
                </a>
                <button
                  class="block w-full text-left px-4 py-2 text-sm text-error hover:bg-gray-100"
                  @click="handleLogout"
                >
                  Выход из аккаунта
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <AppButton variant="outline" size="sm" @click="router.push('/login')">
              Вход
            </AppButton>
            <AppButton variant="primary" size="sm" @click="router.push('/register')">
              Регистрация
            </AppButton>
          </template>

          <!-- Mobile Menu Button -->
          <button
            class="md:hidden p-2 text-gray-600 hover:text-primary"
            @click="showMobileMenu = !showMobileMenu"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                v-if="!showMobileMenu"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="showMobileMenu" class="md:hidden border-t border-gray-400 py-4">
        <template v-if="isAuthenticated">
          <div class="px-4 py-3 border-b border-gray-400 mb-2">
            <p class="font-medium text-gray-900">{{ currentUser?.fullName }}</p>
            <p class="text-sm text-gray-600">{{ currentUser?.email }}</p>
          </div>
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'block px-4 py-3 text-sm font-medium',
              isActive(item.path)
                ? 'text-primary bg-primary-50'
                : 'text-gray-700 hover:bg-gray-100',
            ]"
            @click="showMobileMenu = false"
          >
            {{ item.label }}
          </router-link>
          <a
            href="https://primetop.ru"
            target="_blank"
            rel="noopener noreferrer"
            class="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            О производителе
          </a>
          <button
            class="block w-full text-left px-4 py-3 text-sm font-medium text-error hover:bg-gray-100"
            @click="handleLogout"
          >
            Выход из аккаунта
          </button>
        </template>
        <template v-else>
          <div class="px-4 space-y-2">
            <AppButton variant="outline" :full-width="true" @click="router.push('/login')">
              Вход
            </AppButton>
            <AppButton variant="primary" :full-width="true" @click="router.push('/register')">
              Регистрация
            </AppButton>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>
