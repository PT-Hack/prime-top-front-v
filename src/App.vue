<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppToast from '@/components/common/AppToast.vue'
import ColorPreview from './views/products/ColorPreview.vue'
const authStore = useAuthStore()

onMounted(async () => {
  // Инициализация аутентификации при загрузке приложения
  await authStore.initAuth()
})
</script>

<template>
  <div id="app">
    <RouterView />
    <AppToast />
    <!-- <color-preview></color-preview> -->
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
}
</style>
