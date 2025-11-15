<template>
  <Menubar :model="items" class="custom-menubar transparent-menubar">
    <!-- LOGO / NOME -->
    <template #start>
      <div class="flex items-center gap-2 pl-4">
        <span class="font-semibold text-white text-lg">CoParty</span>
      </div>
    </template>

    <!-- LINKS -->
    <template #item="{ item, props }">
      <RouterLink
        v-if="item.to"
        :to="item.to"
        v-bind="props.action"
        class="nav-link"
      >
        {{ item.label }}
      </RouterLink>
      <a v-else href="#" v-bind="props.action" class="nav-link">
        {{ item.label }}
      </a>
    </template>

    <!-- PERFIL -->
    <template #end>
      <div class="flex items-center pr-4">
        <Button
          icon="pi pi-user"
          @click="$router.push('/perfil')"
          severity="contrast"
          rounded
          variant="outlined"
          class="icon-btn"
        />
      </div>
    </template>
  </Menubar>
</template>

<script setup>
import { ref } from 'vue'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'

const items = ref([
  { label: 'Home', to: '/' },
  { label: 'My Events', to: '/events' },
  { label: 'Create Event', to: '/create' },
  { label: 'My Decks', to: '/decks' }
])
</script>

<style scoped>
/* === NAVBAR TRANSPARENTE === */
.transparent-menubar {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 10;
}

/* Força todos os wrappers internos a herdarem transparência */
:deep(.p-menubar),
:deep(.p-menubar-start),
:deep(.p-menubar-end),
:deep(.p-component),
:deep(.p-menuitem),
:deep(.p-menubar-button) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* === LINKS === */
.nav-link {
  color: white;
  font-weight: 600;
  padding: 0.75rem 1rem;
  text-decoration: none;
  transition: color 0.2s ease-in-out;
  border-radius: 8px;
  display: flex;
  align-items: center;
}
.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: #cbd5e1;
}

/* === BOTÃO PERFIL === */
.icon-btn {
  color: white !important;
  border-color: white !important;
  width: 40px;
  height: 40px;
}
</style>
