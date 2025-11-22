<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { authApi } from '@/services/api/auth.api'
import { formatters } from '@/utils/formatters'
import type { User } from '@/types/auth.types'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'

const { currentUser } = useAuth()
const { showToast } = useToast()

const loading = ref(false)
const editing = ref(false)

const formData = ref({
  last_name: currentUser.value?.last_name || '',
  first_name: currentUser.value?.first_name || '',
  patronymic: currentUser.value?.patronymic || '',
  email: currentUser.value?.email || '',
})

const errors = ref({
  last_name: '',
  first_name: '',
  patronymic: '',
  email: '',
})

const isFormValid = computed(() => {
  return (
    formData.value.last_name.trim() !== '' &&
    formData.value.first_name.trim() !== '' &&
    formData.value.email.trim() !== '' &&
    !errors.value.last_name &&
    !errors.value.first_name &&
    !errors.value.email
  )
})

const hasChanges = computed(() => {
  if (!currentUser.value) return false
  return (
    formData.value.last_name !== currentUser.value.last_name ||
    formData.value.first_name !== currentUser.value.first_name ||
    formData.value.patronymic !== (currentUser.value.patronymic || '') ||
    formData.value.email !== currentUser.value.email
  )
})

const validateField = (field: keyof typeof formData.value) => {
  const value = formData.value[field]

  switch (field) {
    case 'last_name':
      if (!value.trim()) {
        errors.value.last_name = 'Фамилия обязательна для заполнения'
      } else if (value.trim().length < 2) {
        errors.value.last_name = 'Фамилия должна содержать минимум 2 символа'
      } else {
        errors.value.last_name = ''
      }
      break

    case 'first_name':
      if (!value.trim()) {
        errors.value.first_name = 'Имя обязательно для заполнения'
      } else if (value.trim().length < 2) {
        errors.value.first_name = 'Имя должно содержать минимум 2 символа'
      } else {
        errors.value.first_name = ''
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
  }
}

const startEditing = () => {
  editing.value = true
}

const cancelEditing = () => {
  editing.value = false
  // Восстанавливаем исходные значения
  if (currentUser.value) {
    formData.value = {
      last_name: currentUser.value.last_name,
      first_name: currentUser.value.first_name,
      patronymic: currentUser.value.patronymic || '',
      email: currentUser.value.email,
    }
  }
  errors.value = {
    last_name: '',
    first_name: '',
    patronymic: '',
    email: '',
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value || !currentUser.value) return

  loading.value = true

  try {
    const updatedUser = await authApi.updateProfile(currentUser.value.id, {
      last_name: formData.value.last_name.trim(),
      first_name: formData.value.first_name.trim(),
      patronymic: formData.value.patronymic.trim() || null,
      email: formData.value.email.trim(),
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
        v-model="formData.last_name"
        label="Фамилия"
        placeholder="Введите фамилию"
        :error="errors.last_name"
        :disabled="!editing"
        required
        @blur="validateField('last_name')"
      />

      <AppInput
        v-model="formData.first_name"
        label="Имя"
        placeholder="Введите имя"
        :error="errors.first_name"
        :disabled="!editing"
        required
        @blur="validateField('first_name')"
      />

      <AppInput
        v-model="formData.patronymic"
        label="Отчество"
        placeholder="Введите отчество (необязательно)"
        :error="errors.patronymic"
        :disabled="!editing"
        @blur="validateField('patronymic')"
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

      <div class="text-sm text-gray-600">
        <p><strong>Роль:</strong> {{ currentUser?.role?.description || currentUser?.role?.title || 'Не указана' }}</p>
        <p v-if="currentUser?.email_verified_at"><strong>Email подтвержден:</strong> {{ new Date(currentUser.email_verified_at).toLocaleDateString('ru-RU') }}</p>
      </div>
    </form>
  </div>
</template>
