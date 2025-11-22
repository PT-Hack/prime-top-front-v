<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppToast from '@/components/common/AppToast.vue'
<<<<<<< HEAD
// import Valik from '@/views/visuals/Valik.vue'

=======
import ColorPreview from './views/products/ColorPreview.vue'
>>>>>>> e62b260d1ae1e2135caa843d350ea25dd0fa8cf6
const authStore = useAuthStore()

onMounted(async () => {
  // Инициализация аутентификации при загрузке приложения
  await authStore.initAuth()
})
</script>

<template>
  <div id="app">
    <!-- <Valik /> -->
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
