<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
  dot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  rounded: false,
  dot: false,
})

const badgeClasses = computed(() => {
  const classes = ['inline-flex', 'items-center', 'justify-center', 'font-medium']

  // Варианты цветов
  switch (props.variant) {
    case 'primary':
      classes.push('bg-[#054787]', 'text-white')
      break
    case 'success':
      classes.push('bg-green-500', 'text-white')
      break
    case 'warning':
      classes.push('bg-yellow-500', 'text-white')
      break
    case 'danger':
      classes.push('bg-error', 'text-white')
      break
    case 'info':
      classes.push('bg-blue-500', 'text-white')
      break
    case 'gray':
      classes.push('bg-gray-400', 'text-text')
      break
  }

  // Размеры
  switch (props.size) {
    case 'sm':
      classes.push('px-2', 'py-0.5', 'text-xs')
      break
    case 'md':
      classes.push('px-2.5', 'py-1', 'text-sm')
      break
    case 'lg':
      classes.push('px-3', 'py-1.5', 'text-base')
      break
  }

  // Форма
  if (props.rounded) {
    classes.push('rounded-full')
  } else {
    classes.push('rounded')
  }

  // Точка (для счетчиков)
  if (props.dot) {
    classes.push('w-2', 'h-2', 'p-0')
  }

  return classes.join(' ')
})
</script>

<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>
