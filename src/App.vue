<template>
  <div id="app">
    <!-- Nav -->
    <header class="app-header">
      <NavBar />
    </header>

    <!-- Conteúdo (Login, Evento, etc.) -->
    <main class="app-content">
      <router-view />
    </main>

    <!-- Rodapé -->
    <footer class="app-footer">
      <p>© 2025 Meu Sistema</p>
    </footer>
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header fixo */
.app-header {
  background: #3d3d3d;
  border-bottom: 1px solid #515151;
  padding: 1rem;
  text-align: center;
}

/* Conteúdo ocupa o espaço restante */
.app-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  overflow-y: auto;
}

/* Rodapé fixo no fim */
.app-footer {
  background: #3d3d3d;
  border-top: 1px solid #515151;
  text-align: center;
  padding: 1rem;
  flex-shrink: 0;
}
</style>

<script setup>
  import NavBar from "./views/NavBar.vue"
</script>
