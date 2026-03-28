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
        <span v-if="auth.state.user" class="nav-username text-sm hidden md:block" :title="auth.state.user.username">{{ auth.state.user.username }}</span>
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
  min-height: 64px;
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

:deep(.p-menubar) {
  width: 100%;
  position: relative;
  z-index: 40;
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

.nav-username {
  max-width: 14rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .transparent-menubar {
    min-height: 56px;
    padding-inline: 0.2rem;
  }

  :deep(.p-menubar-root-list) {
    gap: 0.2rem;
  }

  .nav-link {
    padding: 0.65rem 0.75rem;
    font-size: 0.92rem;
  }
}

@media (max-width: 640px) {
  .transparent-menubar {
    align-items: flex-start;
    z-index: 60;
  }

  :deep(.p-menubar) {
    width: 100%;
    align-items: flex-start;
    overflow: visible !important;
  }

  :deep(.p-menubar-start) {
    padding-left: 0.15rem;
  }

  :deep(.p-menubar-end) {
    padding-right: 0.15rem;
  }

  .icon-btn {
    width: 36px;
    height: 36px;
  }

  :deep(.p-menubar-button) {
    position: relative;
    z-index: 65;
  }

  :deep(.p-menubar-root-list) {
    position: absolute !important;
    top: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    z-index: 70;
    padding: 0.5rem;
    border-radius: 18px;
    background: rgba(15, 23, 42, 0.96) !important;
    border: 1px solid rgba(148, 163, 184, 0.24) !important;
    box-shadow: 0 22px 48px rgba(2, 6, 23, 0.45) !important;
    backdrop-filter: blur(16px);
  }

  :deep(.p-menubar-root-list > .p-menuitem) {
    width: 100%;
  }

  .nav-link {
    width: 100%;
    border-radius: 12px;
  }
}
</style>
