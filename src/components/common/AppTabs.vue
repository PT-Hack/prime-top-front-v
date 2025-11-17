<script setup lang="ts">
import { ref, provide, computed } from 'vue'

interface Tab {
  label: string
  value: string
  disabled?: boolean
}

interface Props {
  tabs: Tab[]
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'tab-change': [value: string]
}>()

const activeTab = computed({
  get: () => props.modelValue || props.tabs[0]?.value || '',
  set: (value) => {
    emit('update:modelValue', value)
    emit('tab-change', value)
  },
})

provide('activeTab', activeTab)

const selectTab = (tab: Tab) => {
  if (!tab.disabled) {
    activeTab.value = tab.value
  }
}
</script>

<template>
  <div>
    <!-- Tab Headers -->
    <div class="border-b border-gray-400">
      <div class="flex gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          :class="[
            'px-4',
            'py-2',
            'font-medium',
            'transition-colors',
            'border-b-2',
            '-mb-px',
            tab.disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:text-primary',
            activeTab === tab.value
              ? 'text-primary border-primary'
              : 'text-gray-500 border-transparent',
          ]"
          :disabled="tab.disabled"
          @click="selectTab(tab)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>
