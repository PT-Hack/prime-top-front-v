<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { authApi } from '@/services/api/auth.api'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'

const { currentUser } = useAuth()
const { showToast } = useToast()

const loading = ref(false)

const formData = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const errors = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const isFormValid = computed(() => {
  return (
    formData.value.oldPassword !== '' &&
    formData.value.newPassword !== '' &&
    formData.value.confirmPassword !== '' &&
    !errors.value.oldPassword &&
    !errors.value.newPassword &&
    !errors.value.confirmPassword
  )
})

const validateField = (field: keyof typeof formData.value) => {
  const value = formData.value[field]

  switch (field) {
    case 'oldPassword':
      if (!value) {
        errors.value.oldPassword = 'Введите текущий пароль'
      } else {
        errors.value.oldPassword = ''
      }
      break

    case 'newPassword':
      if (!value) {
        errors.value.newPassword = 'Введите новый пароль'
      } else if (value.length < 6) {
        errors.value.newPassword = 'Пароль должен содержать минимум 6 символов'
      } else if (value === formData.value.oldPassword) {
        errors.value.newPassword = 'Новый пароль должен отличаться от старого'
      } else {
        errors.value.newPassword = ''
      }
      // Перепроверяем подтверждение пароля
      if (formData.value.confirmPassword) {
        validateField('confirmPassword')
      }
      break

    case 'confirmPassword':
      if (!value) {
        errors.value.confirmPassword = 'Подтвердите новый пароль'
      } else if (value !== formData.value.newPassword) {
        errors.value.confirmPassword = 'Пароли не совпадают'
      } else {
        errors.value.confirmPassword = ''
      }
      break
  }
}

const resetForm = () => {
  formData.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
  errors.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value || !currentUser.value) return

  loading.value = true

  try {
    await authApi.changePassword(
      currentUser.value.id,
      formData.value.oldPassword,
      formData.value.newPassword,
    )

    showToast('Пароль успешно изменён', 'success')
    resetForm()
  } catch (error) {
    console.error('Ошибка изменения пароля:', error)
    showToast(error instanceof Error ? error.message : 'Не удалось изменить пароль', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-text">Изменить пароль</h3>
      <p class="text-sm text-gray-600 mt-1">Используйте надёжный пароль для защиты аккаунта</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <AppInput
        v-model="formData.oldPassword"
        type="password"
        label="Текущий пароль"
        placeholder="Введите текущий пароль"
        :error="errors.oldPassword"
        :show-password-toggle="true"
        required
        @blur="validateField('oldPassword')"
      />

      <AppInput
        v-model="formData.newPassword"
        type="password"
        label="Новый пароль"
        placeholder="Минимум 6 символов"
        :error="errors.newPassword"
        :show-password-toggle="true"
        required
        @blur="validateField('newPassword')"
      />

      <AppInput
        v-model="formData.confirmPassword"
        type="password"
        label="Подтверждение нового пароля"
        placeholder="Повторите новый пароль"
        :error="errors.confirmPassword"
        :show-password-toggle="true"
        required
        @blur="validateField('confirmPassword')"
      />

      <div class="flex gap-3 pt-2">
        <AppButton
          type="submit"
          variant="primary"
          :disabled="!isFormValid || loading"
          :loading="loading"
        >
          Изменить пароль
        </AppButton>
        <AppButton
          type="button"
          variant="outline"
          @click="resetForm"
          :disabled="loading"
        >
          Очистить
        </AppButton>
      </div>
    </form>
  </div>
</template>
