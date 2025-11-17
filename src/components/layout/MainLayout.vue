<script setup lang="ts">
import AppHeader from './AppHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-bg flex flex-col">
    <AppHeader />

    <main class="flex-1">
      <slot />
    </main>

    <footer class="bg-gray-900 text-white py-8 mt-16">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="text-center md:text-left">
            <h3 class="font-bold text-lg mb-2">Prime Top</h3>
            <p class="text-gray-400 text-sm">
              B2B маркетплейс лакокрасочных материалов
            </p>
          </div>
          <div class="text-center md:text-right text-gray-400 text-sm">
            © 2025 Prime Top. Все права защищены.
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
