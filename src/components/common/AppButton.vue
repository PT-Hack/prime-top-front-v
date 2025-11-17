<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  fullWidth: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const classes = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
  ]

  // Варианты
  switch (props.variant) {
    case 'primary':
      classes.push(
        'bg-[#054787]',
        'text-white',
        'hover:bg-[#0067cb]',
        'focus:ring-primary',
      )
      break
    case 'secondary':
      classes.push(
        'bg-white',
        'text-[#0067cb]',
        'hover:bg-[#0067cb]',
        'hover:text-white',
        'focus:ring-primary',
        'shadow-md',
      )
      break
    case 'danger':
      classes.push(
        'bg-error',
        'text-white',
        'hover:bg-red-700',
        'focus:ring-error',
      )
      break
    case 'ghost':
      classes.push(
        'bg-transparent',
        'text-primary',
        'hover:bg-primary-100',
        'focus:ring-primary',
      )
      break
    case 'outline':
      classes.push(
        'bg-white',
        'text-[#054787]',
        'border-2',
        'border-[#054787]',
        'hover:bg-[#054787]',
        'hover:text-white',
        'focus:ring-primary',
        'shadow-sm',
      )
      break
  }

  // Размеры
  switch (props.size) {
    case 'sm':
      classes.push('px-3', 'py-1.5', 'text-sm')
      break
    case 'md':
      classes.push('px-4', 'py-2', 'text-base')
      break
    case 'lg':
      classes.push('px-6', 'py-3', 'text-lg')
      break
  }

  // Полная ширина
  if (props.fullWidth) {
    classes.push('w-full')
  }

  return classes.join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="mr-2">
      <svg
        class="animate-spin h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </span>
    <slot />
  </button>
</template>
