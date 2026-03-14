<template>
  <Menubar :model="items" class="custom-menubar transparent-menubar">
    <template #start>
      <div class="flex items-center gap-2 pl-4">
        <span class="font-semibold text-white text-lg">Coparty</span>
        <Tag v-if="auth.state.user?.role === 'admin'" value="Admin" severity="danger" rounded />
      </div>
    </template>

    <template #item="{ item, props }">
      <RouterLink v-if="item.to" :to="item.to" v-bind="props.action" class="nav-link">
        {{ item.label }}
      </RouterLink>
      <a v-else href="#" v-bind="props.action" class="nav-link">{{ item.label }}</a>
    </template>

    <template #end>
      <div class="flex items-center gap-2 pr-4 text-white">
        <span v-if="auth.state.user" class="text-sm hidden md:block">{{ auth.state.user.username }}</span>
        <Button icon="pi pi-user" @click="$router.push('/profile')" severity="contrast" rounded variant="outlined" class="icon-btn" />
        <Button
          v-if="auth.state.isAuthenticated"
          icon="pi pi-sign-out"
          @click="logout"
          severity="contrast"
          rounded
          variant="outlined"
          class="icon-btn"
          :loading="loggingOut"
        />
      </div>
    </template>
  </Menubar>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { getErrorMessage } from '@/services/error'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()
const loggingOut = ref(false)

const items = computed(() => {
  if (!auth.state.isAuthenticated) {
    return [
      { label: 'Login', to: '/login' },
      { label: 'Cadastro', to: '/signup' },
    ]
  }

  const base = [
    { label: 'Eventos', to: '/events' },
    { label: 'Decks', to: '/decks' },
    { label: 'Ranking Players', to: '/rankings/players' },
    { label: 'Ranking Decks', to: '/rankings/decks' },
  ]

  if (auth.state.user?.role === 'admin') {
    base.push({ label: 'Admin', to: '/admin' })
  }

  return base
})

async function logout() {
  loggingOut.value = true
  try {
    await auth.logout()
    toast.add({
      severity: 'success',
      summary: 'Sessao encerrada',
      detail: 'Voce foi redirecionado para o login.',
      life: 2500,
    })
    await router.push('/login')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Falha ao sair',
      detail: getErrorMessage(error, 'Nao foi possivel encerrar a sessao.'),
      life: 4000,
    })
  } finally {
    loggingOut.value = false
  }
}
</script>

<style scoped>
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

.icon-btn {
  color: white !important;
  border-color: white !important;
  width: 40px;
  height: 40px;
}
</style>
