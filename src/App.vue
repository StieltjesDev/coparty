<template>
  <div class="flex flex-column min-h-screen">
    <Toast />
    <ConfirmDialog />

    <header class="text-center p-3 border-bottom-1 border-gray-700 app-panel">
      <NavBar />
    </header>

    <main class="flex-grow-1 flex align-items-center justify-content-center p-4 overflow-auto">
      <router-view />
    </main>

    <footer class="text-center p-3 border-top-1 border-gray-700 app-panel">
      <p class="m-0">(c) {{ currentYear }} Coparty</p>
    </footer>
  </div>
</template>

<script setup>
import ConfirmDialog from 'primevue/confirmdialog'
import NavBar from './views/NavBar.vue'
import Toast from 'primevue/toast'

const currentYear = new Date().getFullYear()
</script>
