<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'
import { validators } from '@/utils/validators'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const { showError, showSuccess } = useNotifications()

const login = ref('')
const password = ref('')
const rememberMe = ref(false)
const errors = ref<{ login?: string; password?: string }>({})
const isSubmitting = ref(false)

const isValid = computed(() => {
  return login.value && password.value && !errors.value.login && !errors.value.password
})

const validateLogin = () => {
  if (!login.value) {
    errors.value.login = 'Введите email'
  } else if (!validators.email(login.value)) {
    errors.value.login = 'Неверный формат email'
  } else {
    errors.value.login = undefined
  }
}

const validatePassword = () => {
  if (!password.value) {
    errors.value.password = 'Введите пароль'
  } else {
    errors.value.password = undefined
  }
}

const handleSubmit = async () => {
  validateLogin()
  validatePassword()

  if (!isValid.value) return

  isSubmitting.value = true

  try {
    await authStore.login({ email: login.value, password: password.value })
    showSuccess('Вы успешно вошли в систему')
    router.push('/')
  } catch (error: any) {
    showError(error.message || 'Ошибка входа')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div>
      <AppInput v-model="login" type="email" label="Email" placeholder="example@company.ru" :error="errors.login"
        :full-width="true" @blur="validateLogin" @input="errors.login = undefined" />
    </div>

    <div>
      <AppInput v-model="password" type="password" label="Пароль" placeholder="Введите пароль"
        :show-password-toggle="true" :error="errors.password" :full-width="true" @blur="validatePassword"
        @input="errors.password = undefined" />
    </div>

    <div class="flex items-center justify-between">
      <label class="flex items-center gap-2">
        <input v-model="rememberMe" type="checkbox"
          class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
        <span class="text-sm text-gray-600">Запомнить меня</span>
      </label>

      <slot name="forgot-password">
        <button type="button" class="text-sm text-primary hover:text-primary-dark" @click="$emit('forgot-password')">
          Забыли пароль?
        </button>
      </slot>
    </div>

    <AppButton type="submit" variant="primary" size="lg" :full-width="true" :loading="isSubmitting"
      :disabled="!isValid || isSubmitting">
      Войти
    </AppButton>

    <slot name="register-link">
      <p class="text-center text-sm text-gray-600">
        Нет аккаунта?
        <button type="button" class="text-primary hover:text-primary-dark font-medium" @click="$emit('register')">
          Зарегистрироваться
        </button>
      </p>
    </slot>
  </form>
</template>
