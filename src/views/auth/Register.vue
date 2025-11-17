<script setup lang="ts">
import { useRouter } from 'vue-router'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import AppCard from '@/components/common/AppCard.vue'

const router = useRouter()

const handleLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Prime Top</h1>
        <p class="text-gray-600">B2B маркетплейс лакокрасочных материалов</p>
      </div>

      <AppCard padding="lg" shadow="lg">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Регистрация</h2>
          <p class="text-sm text-gray-600 mt-1">Создайте аккаунт для доступа к платформе</p>
        </div>

        <RegisterForm @login="handleLogin" />
      </AppCard>

      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600">
          После регистрации вы сможете создать компанию или присоединиться к существующей
        </p>
      </div>
    </div>
  </div>
</template>
