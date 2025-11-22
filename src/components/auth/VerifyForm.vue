<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'

interface Props {
  userId: string
  email?: string
}

const props = defineProps<Props>()
const router = useRouter()
const authStore = useAuthStore()
const { showError, showSuccess } = useNotifications()

const code = ref('')
const isSubmitting = ref(false)

const codeInputs = ref<string[]>(['', '', '', '', '', ''])
const inputRefs = ref<(HTMLInputElement | null)[]>([])

const isValid = computed(() => {
  return code.value.length === 6 && /^\d+$/.test(code.value)
})

// Функция для установки ref
const setInputRef = (index: number) => {
  return (el: Element | null) => {
    if (el) {
      inputRefs.value[index] = el as HTMLInputElement
    }
  }
}

// Автоматическое заполнение кода из отдельных полей
watch(codeInputs, (newValues) => {
  code.value = newValues.join('')
}, { deep: true })

// Обработка ввода в отдельные поля
const handleInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '').slice(0, 1)
  
  codeInputs.value[index] = value
  
  // Переход к следующему полю
  if (value && index < 5) {
    inputRefs.value[index + 1]?.focus()
  }
  
  // Обновляем общий код
  code.value = codeInputs.value.join('')
}

// Обработка удаления
const handleKeyDown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !codeInputs.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
}

// Обработка вставки из буфера обмена
const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) || ''
  
  for (let i = 0; i < 6; i++) {
    codeInputs.value[i] = pastedData[i] || ''
  }
  
  code.value = codeInputs.value.join('')
  
  // Фокус на последнее заполненное поле или последнее поле
  const lastFilledIndex = Math.min(pastedData.length - 1, 5)
  inputRefs.value[lastFilledIndex]?.focus()
}

const handleSubmit = async () => {
  if (!isValid.value) {
    showError('Введите 6-значный код подтверждения')
    return
  }

  isSubmitting.value = true

  try {
    await authStore.verify({
      user_id: props.userId,
      code: code.value,
    })
    
    showSuccess('Email успешно подтвержден! Добро пожаловать!')
    router.push('/')
  } catch (error: any) {
    showError(error.message || 'Неверный код подтверждения')
    // Очищаем поля при ошибке
    codeInputs.value = ['', '', '', '', '', '']
    code.value = ''
    inputRefs.value[0]?.focus()
  } finally {
    isSubmitting.value = false
  }
}

// Фокус на первое поле при монтировании
const focusFirstInput = () => {
  inputRefs.value[0]?.focus()
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div>
      <p class="text-sm text-gray-600 mb-4 text-center">
        <span v-if="email">Мы отправили код подтверждения на <strong>{{ email }}</strong></span>
        <span v-else>Введите 6-значный код подтверждения, отправленный на вашу почту</span>
      </p>
      
      <div class="flex justify-center gap-2 mb-4">
        <input
          v-for="(digit, index) in codeInputs"
          :key="index"
          :ref="setInputRef(index)"
          v-model="codeInputs[index]"
          type="text"
          inputmode="numeric"
          maxlength="1"
          class="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-colors"
          :class="{ 'border-red-500': !isValid && code.length === 6 }"
          @input="handleInput(index, $event)"
          @keydown="handleKeyDown(index, $event)"
          @paste="handlePaste"
          @focus="focusFirstInput"
        />
      </div>
      
      <p v-if="!isValid && code.length > 0" class="text-sm text-red-600 text-center">
        Код должен содержать 6 цифр
      </p>
    </div>

    <AppButton
      type="submit"
      variant="primary"
      size="lg"
      :full-width="true"
      :loading="isSubmitting"
      :disabled="!isValid || isSubmitting"
    >
      Подтвердить
    </AppButton>

    <div class="text-center">
      <p class="text-sm text-gray-600">
        Не получили код?
        <button
          type="button"
          class="text-primary hover:text-primary-dark font-medium"
          @click="$emit('resend')"
        >
          Отправить повторно
        </button>
      </p>
    </div>
  </form>
</template>

