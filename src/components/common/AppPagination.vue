<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  maxVisiblePages?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 5,
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'page-change': [page: number]
}>()

const pages = computed(() => {
  const pages: (number | string)[] = []
  const { currentPage, totalPages, maxVisiblePages } = props

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    const half = Math.floor(maxVisiblePages / 2)
    let start = currentPage - half
    let end = currentPage + half

    if (start < 1) {
      start = 1
      end = maxVisiblePages
    }

    if (end > totalPages) {
      end = totalPages
      start = totalPages - maxVisiblePages + 1
    }

    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push('...')
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }
  }

  return pages
})

const changePage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page)
    emit('page-change', page)
  }
}

const prevPage = () => {
  if (props.currentPage > 1) {
    changePage(props.currentPage - 1)
  }
}

const nextPage = () => {
  if (props.currentPage < props.totalPages) {
    changePage(props.currentPage + 1)
  }
}
</script>

<template>
  <div class="flex items-center justify-center gap-2">
    <!-- Previous -->
    <button
      type="button"
      :disabled="currentPage === 1"
      class="px-3 py-2 rounded-lg border border-gray-400 text-text hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      @click="prevPage"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>

    <!-- Pages -->
    <template v-for="(page, index) in pages" :key="index">
      <button
        v-if="typeof page === 'number'"
        type="button"
        :class="[
          'px-4',
          'py-2',
          'rounded-lg',
          'border',
          'transition-colors',
          page === currentPage
            ? 'bg-[#054787] text-white border-[#054787]'
            : 'border-gray-400 text-text hover:bg-gray-300',
        ]"
        @click="changePage(page)"
      >
        {{ page }}
      </button>
      <span v-else class="px-2 text-gray-500">{{ page }}</span>
    </template>

    <!-- Next -->
    <button
      type="button"
      :disabled="currentPage === totalPages"
      class="px-3 py-2 rounded-lg border border-gray-400 text-text hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      @click="nextPage"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  </div>
</template>
