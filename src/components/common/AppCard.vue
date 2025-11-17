<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  subtitle?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  padding: 'md',
  shadow: 'md',
  hoverable: false,
})

const cardClasses = computed(() => {
  const classes = ['bg-white', 'rounded-lg', 'border-2', 'border-gray-300', 'transition-all']

  // Тени
  switch (props.shadow) {
    case 'none':
      break
    case 'sm':
      classes.push('shadow-sm')
      break
    case 'md':
      classes.push('shadow-md')
      break
    case 'lg':
      classes.push('shadow-lg')
      break
  }

  // Наведение
  if (props.hoverable) {
    classes.push('cursor-pointer', 'hover:shadow-lg', 'hover:border-primary')
  }

  return classes.join(' ')
})

const contentClasses = computed(() => {
  const classes = []

  // Отступы
  switch (props.padding) {
    case 'none':
      break
    case 'sm':
      classes.push('p-3')
      break
    case 'md':
      classes.push('p-4')
      break
    case 'lg':
      classes.push('p-6')
      break
  }

  return classes.join(' ')
})
</script>

<template>
  <div :class="cardClasses">
    <div
      v-if="title || subtitle || $slots.header"
      :class="[contentClasses, 'border-b-2', 'border-gray-300']"
    >
      <slot name="header">
        <h3 v-if="title" class="text-lg font-semibold text-text">{{ title }}</h3>
        <p v-if="subtitle" class="text-sm text-gray-500 mt-1">{{ subtitle }}</p>
      </slot>
    </div>

    <div :class="contentClasses">
      <slot />
    </div>

    <div v-if="$slots.footer" :class="[contentClasses, 'border-t-2', 'border-gray-300']">
      <slot name="footer" />
    </div>
  </div>
</template>
