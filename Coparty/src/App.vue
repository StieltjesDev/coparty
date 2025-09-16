<template>
  <div>
    <nav>
      <router-link to="/">Login</router-link> |
      <router-link to="/evento">Criar Evento</router-link>
    </nav>

    <!-- Aqui o Vue Router vai renderizar a rota atual -->
    <router-view />
  </div>
</template>