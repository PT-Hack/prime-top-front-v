<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
import { validators } from '@/utils/validators'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'

const emit = defineEmits<{
  close: []
  'back-to-login': []
}>()

const { showSuccess, showError } = useNotifications()

const email = ref('')
const emailError = ref('')
const isSubmitting = ref(false)
const isSuccess = ref(false)

const isValid = computed(() => {
  return email.value && !emailError.value
})

const validateEmail = () => {
  if (!email.value) {
    emailError.value = 'Введите email'
  } else if (!validators.email(email.value)) {
    emailError.value = 'Неверный формат email'
  } else {
    emailError.value = ''
  }
}

const handleSubmit = async () => {
  validateEmail()

  if (!isValid.value) return

  isSubmitting.value = true

  try {
    // Имитация отправки запроса на восстановление пароля
    await new Promise((resolve) => setTimeout(resolve, 1000))

    isSuccess.value = true
    showSuccess('Инструкции по восстановлению пароля отправлены на ваш email')
  } catch (error: any) {
    showError(error.message || 'Ошибка отправки запроса')
  } finally {
    isSubmitting.value = false
  }
}

const handleBackToLogin = () => {
  emit('back-to-login')
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="!isSuccess">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Восстановление пароля</h2>
        <p class="text-sm text-gray-600">
          Введите email, указанный при регистрации, и мы отправим вам инструкции по восстановлению пароля
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <AppInput
            v-model="email"
            type="email"
            label="Email"
            placeholder="example@company.ru"
            :error="emailError"
            :full-width="true"
            @blur="validateEmail"
            @input="emailError = ''"
          />
        </div>

        <div class="flex gap-3">
          <AppButton
            type="submit"
            variant="primary"
            size="lg"
            :full-width="true"
            :loading="isSubmitting"
            :disabled="!isValid || isSubmitting"
          >
            Отправить инструкции
          </AppButton>
        </div>

        <div class="text-center">
          <button
            type="button"
            class="text-sm text-primary hover:text-primary-dark"
            @click="handleBackToLogin"
          >
            Вернуться к входу
          </button>
        </div>
      </form>
    </div>

    <div v-else class="text-center py-8">
      <div class="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h3 class="text-xl font-bold text-gray-900 mb-2">Проверьте вашу почту</h3>
      <p class="text-gray-600 mb-6">
        Мы отправили инструкции по восстановлению пароля на {{ email }}
      </p>

      <AppButton variant="primary" size="lg" @click="handleBackToLogin">
        Вернуться к входу
      </AppButton>
    </div>
  </div>
</template>
