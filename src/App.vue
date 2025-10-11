<template>
  <div class="flex flex-column min-h-screen">
    <!-- Toast global -->
    <Toast />

    <!-- Header -->
    <header class="text-center p-3 border-bottom-1 border-gray-700">
      <NavBar />
    </header>

    <!-- Conteúdo principal -->
    <main class="flex-grow-1 flex align-items-center justify-content-center p-4 overflow-auto">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="text-center p-3 border-top-1 border-gray-700">
      <p class="m-0">© 2025 Coparty</p>
    </footer>
  </div>
</template>

<script setup>
import NavBar from "./views/NavBar.vue";
import Toast from "primevue/toast";
</script>
