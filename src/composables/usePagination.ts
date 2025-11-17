import { ref, computed } from 'vue'
import { PAGINATION } from '@/utils/constants'

export function usePagination(totalItems = ref(0), perPageDefault = PAGINATION.DEFAULT_PER_PAGE) {
  const page = ref(PAGINATION.DEFAULT_PAGE)
  const perPage = ref(perPageDefault)

  const totalPages = computed(() => {
    return Math.ceil(totalItems.value / perPage.value)
  })

  const startIndex = computed(() => {
    return (page.value - 1) * perPage.value
  })

  const endIndex = computed(() => {
    return Math.min(startIndex.value + perPage.value, totalItems.value)
  })

  const hasPrevPage = computed(() => {
    return page.value > 1
  })

  const hasNextPage = computed(() => {
    return page.value < totalPages.value
  })

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages.value) {
      page.value = pageNumber
    }
  }

  const nextPage = () => {
    if (hasNextPage.value) {
      page.value++
    }
  }

  const prevPage = () => {
    if (hasPrevPage.value) {
      page.value--
    }
  }

  const setPerPage = (value: number) => {
    perPage.value = value
    page.value = 1 // Reset to first page
  }

  const reset = () => {
    page.value = PAGINATION.DEFAULT_PAGE
    perPage.value = perPageDefault
  }

  return {
    page,
    perPage,
    totalPages,
    startIndex,
    endIndex,
    hasPrevPage,
    hasNextPage,
    goToPage,
    nextPage,
    prevPage,
    setPerPage,
    reset,
  }
}
