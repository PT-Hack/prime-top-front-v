<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { authApi } from '@/services/api/auth.api'
import type { User } from '@/types/auth.types'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'

const { currentUser } = useAuth()
const { showToast } = useToast()

const loading = ref(false)
const editing = ref(false)

const formData = ref({
  fullName: currentUser.value?.fullName || '',
  email: currentUser.value?.email || '',
  phone: currentUser.value?.phone || '',
})

const errors = ref({
  fullName: '',
  email: '',
  phone: '',
})

const isFormValid = computed(() => {
  return (
    formData.value.fullName.trim() !== '' &&
    formData.value.email.trim() !== '' &&
    !errors.value.fullName &&
    !errors.value.email &&
    !errors.value.phone
  )
})

const hasChanges = computed(() => {
  return (
    formData.value.fullName !== currentUser.value?.fullName ||
    formData.value.email !== currentUser.value?.email ||
    formData.value.phone !== (currentUser.value?.phone || '')
  )
})

const validateField = (field: keyof typeof formData.value) => {
  const value = formData.value[field]

  switch (field) {
    case 'fullName':
      if (!value.trim()) {
        errors.value.fullName = 'Имя обязательно для заполнения'
      } else if (value.trim().length < 2) {
        errors.value.fullName = 'Имя должно содержать минимум 2 символа'
      } else {
        errors.value.fullName = ''
      }
      break

    case 'email':
      if (!value.trim()) {
        errors.value.email = 'Email обязателен для заполнения'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.value.email = 'Некорректный формат email'
      } else {
        errors.value.email = ''
      }
      break

    case 'phone':
      if (value && !/^\+?[\d\s\-()]+$/.test(value)) {
        errors.value.phone = 'Некорректный формат телефона'
      } else {
        errors.value.phone = ''
      }
      break
  }
}

const startEditing = () => {
  editing.value = true
}

const cancelEditing = () => {
  editing.value = false
  // Восстанавливаем исходные значения
  formData.value = {
    fullName: currentUser.value?.fullName || '',
    email: currentUser.value?.email || '',
    phone: currentUser.value?.phone || '',
  }
  errors.value = {
    fullName: '',
    email: '',
    phone: '',
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value || !currentUser.value) return

  loading.value = true

  try {
    const updatedUser = await authApi.updateProfile(currentUser.value.id, {
      fullName: formData.value.fullName.trim(),
      email: formData.value.email.trim(),
      phone: formData.value.phone.trim() || undefined,
    })

    // Обновляем currentUser через store
    if (currentUser.value) {
      Object.assign(currentUser.value, updatedUser)
    }

    showToast('Профиль успешно обновлён', 'success')
    editing.value = false
  } catch (error) {
    console.error('Ошибка обновления профиля:', error)
    showToast(error instanceof Error ? error.message : 'Не удалось обновить профиль', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-text">Личные данные</h3>
      <AppButton
        v-if="!editing"
        variant="outline"
        size="sm"
        @click="startEditing"
      >
        Редактировать
      </AppButton>
      <div v-else class="flex gap-2">
        <AppButton
          variant="outline"
          size="sm"
          @click="cancelEditing"
          :disabled="loading"
        >
          Отмена
        </AppButton>
        <AppButton
          variant="primary"
          size="sm"
          @click="handleSubmit"
          :disabled="!isFormValid || !hasChanges || loading"
          :loading="loading"
        >
          Сохранить
        </AppButton>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <AppInput
        v-model="formData.fullName"
        label="ФИО"
        placeholder="Введите полное имя"
        :error="errors.fullName"
        :disabled="!editing"
        required
        @blur="validateField('fullName')"
      />

      <AppInput
        v-model="formData.email"
        type="email"
        label="Email"
        placeholder="email@example.com"
        :error="errors.email"
        :disabled="!editing"
        required
        @blur="validateField('email')"
      />

      <AppInput
        v-model="formData.phone"
        type="tel"
        label="Телефон"
        placeholder="+7 (999) 123-45-67"
        :error="errors.phone"
        :disabled="!editing"
        @blur="validateField('phone')"
      />

      <div class="text-sm text-gray-600">
        <p><strong>Роль:</strong> {{ currentUser?.role }}</p>
        <p><strong>Дата регистрации:</strong> {{ new Date(currentUser?.createdAt || '').toLocaleDateString('ru-RU') }}</p>
      </div>
    </form>
  </div>
</template>
