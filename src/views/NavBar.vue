<template>
  <nav class="flex items-center justify-between shadow-md">
    <!-- Links à ESQUERDA -->
    <div class="flex items-center gap-6">
      <RouterLink to="/" class="nav-link">Home</RouterLink>
      <RouterLink to="/" class="nav-link">My Events</RouterLink>
      <RouterLink to="/create" class="nav-link">Create Event</RouterLink>
    </div>

    <!-- Ícones à DIREITA -->
    <div class="flex items-center gap-3">
      <!-- <Button icon="pi pi-bell" severity="contrast" rounded variant="outlined" class="icon-btn" /> -->
      <Button icon="pi pi-user" v-on:click="$router.push('/perfil')" severity="contrast" rounded variant="outlined" class="icon-btn" />
    </div>
  </nav>
</template>

<script setup>
import Button from 'primevue/button'
</script>

<style>
.justify-between {
  justify-content: space-between;
}

/* LINKS DO MENU */
.nav-link {
  color: white;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease-in-out;
  display: flex;
  align-items: center;
}

.nav-link:hover {
  color: #c0c0c0
}

/* BOTÕES DE ÍCONE */
.icon-btn {
  color: white !important;
}
</style>
