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

const fullName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreeToTerms = ref(false)

const errors = ref<{
  fullName?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
}>({})

const isSubmitting = ref(false)

const isValid = computed(() => {
  return (
    fullName.value &&
    email.value &&
    password.value &&
    confirmPassword.value &&
    agreeToTerms.value &&
    !errors.value.fullName &&
    !errors.value.email &&
    !errors.value.phone &&
    !errors.value.password &&
    !errors.value.confirmPassword
  )
})

const validateFullName = () => {
  if (!fullName.value) {
    errors.value.fullName = 'Введите ФИО'
  } else if (fullName.value.length < 3) {
    errors.value.fullName = 'ФИО должно содержать минимум 3 символа'
  } else {
    errors.value.fullName = undefined
  }
}

const validateEmail = () => {
  if (!email.value) {
    errors.value.email = 'Введите email'
  } else if (!validators.email(email.value)) {
    errors.value.email = 'Неверный формат email'
  } else {
    errors.value.email = undefined
  }
}

const validatePhone = () => {
  if (phone.value && !validators.phone(phone.value)) {
    errors.value.phone = 'Неверный формат телефона'
  } else {
    errors.value.phone = undefined
  }
}

const validatePassword = () => {
  if (!password.value) {
    errors.value.password = 'Введите пароль'
  } else if (password.value.length < 8) {
    errors.value.password = 'Пароль должен содержать минимум 8 символов'
  } else {
    errors.value.password = undefined
  }
}

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    errors.value.confirmPassword = 'Подтвердите пароль'
  } else if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Пароли не совпадают'
  } else {
    errors.value.confirmPassword = undefined
  }
}

const handleSubmit = async () => {
  validateFullName()
  validateEmail()
  validatePhone()
  validatePassword()
  validateConfirmPassword()

  if (!isValid.value) return

  isSubmitting.value = true

  try {
    await authStore.register({
      login: email.value,
      password: password.value,
      fullName: fullName.value,
      phone: phone.value || undefined,
    })
    showSuccess('Регистрация успешна! Добро пожаловать!')
    router.push('/')
  } catch (error: any) {
    showError(error.message || 'Ошибка регистрации')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div>
      <AppInput
        v-model="fullName"
        type="text"
        label="ФИО"
        placeholder="Иванов Иван Иванович"
        :error="errors.fullName"
        :full-width="true"
        @blur="validateFullName"
        @input="errors.fullName = undefined"
      />
    </div>

    <div>
      <AppInput
        v-model="email"
        type="email"
        label="Email"
        placeholder="example@company.ru"
        :error="errors.email"
        :full-width="true"
        @blur="validateEmail"
        @input="errors.email = undefined"
      />
    </div>

    <div>
      <AppInput
        v-model="phone"
        type="tel"
        label="Телефон (необязательно)"
        placeholder="+7 (999) 123-45-67"
        :error="errors.phone"
        :full-width="true"
        @blur="validatePhone"
        @input="errors.phone = undefined"
      />
    </div>

    <div>
      <AppInput
        v-model="password"
        type="password"
        label="Пароль"
        placeholder="Введите пароль"
        :show-password-toggle="true"
        :error="errors.password"
        :full-width="true"
        @blur="validatePassword"
        @input="errors.password = undefined"
      />
    </div>

    <div>
      <AppInput
        v-model="confirmPassword"
        type="password"
        label="Подтвердите пароль"
        placeholder="Введите пароль еще раз"
        :show-password-toggle="true"
        :error="errors.confirmPassword"
        :full-width="true"
        @blur="validateConfirmPassword"
        @input="errors.confirmPassword = undefined"
      />
    </div>

    <div>
      <label class="flex items-start gap-2">
        <input
          v-model="agreeToTerms"
          type="checkbox"
          class="w-4 h-4 mt-1 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <span class="text-sm text-gray-600">
          Я согласен с
          <a href="#" class="text-primary hover:text-primary-dark">условиями использования</a>
          и
          <a href="#" class="text-primary hover:text-primary-dark">политикой конфиденциальности</a>
        </span>
      </label>
    </div>

    <AppButton
      type="submit"
      variant="primary"
      size="lg"
      :full-width="true"
      :loading="isSubmitting"
      :disabled="!isValid || isSubmitting"
    >
      Зарегистрироваться
    </AppButton>

    <slot name="login-link">
      <p class="text-center text-sm text-gray-600">
        Уже есть аккаунт?
        <button
          type="button"
          class="text-primary hover:text-primary-dark font-medium"
          @click="$emit('login')"
        >
          Войти
        </button>
      </p>
    </slot>
  </form>
</template>
