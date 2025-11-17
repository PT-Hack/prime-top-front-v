<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppButton from '@/components/common/AppButton.vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-primary mb-4">404</h1>
      <h2 class="text-3xl font-bold text-gray-900 mb-4">Страница не найдена</h2>
      <p class="text-gray-600 mb-8">
        К сожалению, запрашиваемая страница не существует или была перемещена
      </p>
      <div class="flex gap-4 justify-center">
        <AppButton variant="outline" @click="goBack">
          Назад
        </AppButton>
        <AppButton variant="primary" @click="goHome">
          На главную
        </AppButton>
      </div>
    </div>
  </div>
</template>
