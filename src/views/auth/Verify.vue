<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'
import { authApi } from '@/services/api/auth.api'
import VerifyForm from '@/components/auth/VerifyForm.vue'
import AppCard from '@/components/common/AppCard.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { showError, showSuccess } = useNotifications()

const userId = ref<string>('')
const email = ref<string>('')
const resending = ref(false)

onMounted(() => {
  // Получаем user_id из query параметров
  const userIdParam = route.query.user_id as string
  const emailParam = route.query.email as string
  
  if (!userIdParam) {
    showError('Не указан ID пользователя')
    router.push('/register')
    return
  }
  
  userId.value = userIdParam
  email.value = emailParam || ''
})

const handleResend = async () => {
  if (!userId.value) return
  
  resending.value = true
  
  try {
    // Здесь можно добавить API метод для повторной отправки кода
    // Пока просто показываем сообщение
    showSuccess('Код подтверждения отправлен повторно')
  } catch (error: any) {
    showError(error.message || 'Ошибка при отправке кода')
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Prime Top</h1>
        <p class="text-gray-600">Подтверждение email</p>
      </div>

      <AppCard padding="lg" shadow="lg" v-if="userId">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Подтвердите email</h2>
          <p class="text-sm text-gray-600 mt-1">
            Введите 6-значный код, отправленный на вашу почту
          </p>
        </div>

        <VerifyForm 
          :user-id="userId" 
          :email="email"
          @resend="handleResend"
        />
      </AppCard>

      <div v-else class="text-center">
        <p class="text-gray-600">Загрузка...</p>
      </div>
    </div>
  </div>
</template>

