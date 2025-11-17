<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray'
  fullscreen?: boolean
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  fullscreen: false,
  text: '',
})

const sizeClasses: Record<string, string> = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

const colorClasses: Record<string, string> = {
  primary: 'text-primary',
  white: 'text-white',
  gray: 'text-gray-500',
}

const loaderClasses = computed(() => {
  return [sizeClasses[props.size], colorClasses[props.color], 'animate-spin'].join(' ')
})
</script>

<template>
  <div
    :class="[
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'gap-3',
      fullscreen ? 'fixed inset-0 bg-white bg-opacity-90 z-50' : '',
    ]"
  >
    <svg
      :class="loaderClasses"
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
    <p v-if="text" class="text-gray-600">{{ text }}</p>
  </div>
</template>
