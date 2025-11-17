<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LoginForm from '@/components/auth/LoginForm.vue'
import PasswordRecovery from '@/components/auth/PasswordRecovery.vue'
import AppModal from '@/components/common/AppModal.vue'
import AppCard from '@/components/common/AppCard.vue'

const router = useRouter()
const showPasswordRecovery = ref(false)

const handleRegister = () => {
  router.push('/register')
}

const handleForgotPassword = () => {
  showPasswordRecovery.value = true
}

const handleBackToLogin = () => {
  showPasswordRecovery.value = false
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
          <h2 class="text-2xl font-bold text-gray-900">Вход в систему</h2>
          <p class="text-sm text-gray-600 mt-1">Войдите в свой аккаунт для доступа к платформе</p>
        </div>

        <LoginForm
          @register="handleRegister"
          @forgot-password="handleForgotPassword"
        />

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Тестовые аккаунты</span>
            </div>
          </div>

          <div class="mt-4 space-y-2">
            <details class="bg-gray-50 rounded-lg p-3">
              <summary class="cursor-pointer text-sm font-medium text-gray-700">
                Показать тестовые учетные данные
              </summary>
              <div class="mt-3 space-y-2 text-xs text-gray-600">
                <div class="bg-white rounded p-2">
                  <div class="font-medium">Менеджер компании:</div>
                  <div>Email: manager@tehcom.ru</div>
                  <div>Пароль: password123</div>
                </div>
                <div class="bg-white rounded p-2">
                  <div class="font-medium">Админ компании:</div>
                  <div>Email: admin@tehcom.ru</div>
                  <div>Пароль: password123</div>
                </div>
                <div class="bg-white rounded p-2">
                  <div class="font-medium">Менеджер системы:</div>
                  <div>Email: system.manager@primetop.ru</div>
                  <div>Пароль: password123</div>
                </div>
                <div class="bg-white rounded p-2">
                  <div class="font-medium">Админ системы:</div>
                  <div>Email: system.admin@primetop.ru</div>
                  <div>Пароль: password123</div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </AppCard>
    </div>

    <AppModal
      :model-value="showPasswordRecovery"
      size="md"
      @update:model-value="showPasswordRecovery = $event"
      @close="handleBackToLogin"
    >
      <PasswordRecovery
        @close="handleBackToLogin"
        @back-to-login="handleBackToLogin"
      />
    </AppModal>
  </div>
</template>
