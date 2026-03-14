<template>
  <div class="page-shell">
    <div class="page-card flex flex-column gap-4">
      <Card class="form-card">
        <template #title>
          <div class="flex justify-content-between align-items-center flex-wrap gap-3">
            <span>Minha sessao</span>
            <Tag :value="auth.state.user?.role || 'guest'" :severity="auth.state.user?.role === 'admin' ? 'danger' : 'info'" />
          </div>
        </template>
        <template #content>
          <div v-if="auth.state.loading" class="text-center py-3">Carregando sessao...</div>
          <div v-else class="grid">
            <div class="col-12 md:col-6"><strong>Usuario:</strong> {{ auth.state.user?.username || '-' }}</div>
            <div class="col-12 md:col-6"><strong>E-mail:</strong> {{ auth.state.user?.email || 'Nao informado' }}</div>
            <div class="col-12 md:col-6"><strong>Role:</strong> {{ auth.state.user?.role || '-' }}</div>
            <div class="col-12 md:col-6"><strong>Status:</strong> {{ auth.state.isAuthenticated ? 'Autenticado' : 'Nao autenticado' }}</div>
          </div>
          <Message class="mt-3" severity="secondary" :closable="false">
            Logout agora usa o endpoint real do backend e limpa o cookie httpOnly da sessao.
          </Message>
          <div class="mt-3 flex justify-content-end">
            <Button label="Encerrar sessao" icon="pi pi-sign-out" severity="secondary" :loading="loggingOut" @click="logout" />
          </div>
        </template>
      </Card>

      <Card class="form-card">
        <template #title>
          <div class="flex justify-content-between align-items-center flex-wrap gap-3">
            <span>Player</span>
            <Tag :value="playerStore.state.player ? 'Pronto para beta' : 'Bootstrap pendente'" :severity="playerStore.state.player ? 'success' : 'warn'" />
          </div>
        </template>
        <template #content>
          <div v-if="playerStore.state.loading" class="text-center py-3">Carregando player...</div>
          <div v-else-if="playerStore.state.player" class="grid">
            <div class="col-12 md:col-6"><strong>Display name:</strong> {{ playerStore.state.player.displayName }}</div>
            <div class="col-12 md:col-6"><strong>Pontos:</strong> {{ playerStore.state.player.points }}</div>
            <div class="col-12 md:col-4"><strong>Wins:</strong> {{ playerStore.state.player.wins }}</div>
            <div class="col-12 md:col-4"><strong>Losses:</strong> {{ playerStore.state.player.losses }}</div>
            <div class="col-12 md:col-4"><strong>Draws:</strong> {{ playerStore.state.player.draws }}</div>
          </div>
          <form v-else class="flex flex-column gap-3" @submit.prevent="createPlayerProfile">
            <Message severity="warn" :closable="false">
              Voce precisa criar um player antes de cadastrar decks ou entrar em eventos.
            </Message>

            <div>
              <FloatLabel variant="on">
                <InputText id="displayName" v-model="displayName" fluid />
                <label for="displayName">Display name</label>
              </FloatLabel>
            </div>

            <div class="flex justify-content-end">
              <Button type="submit" label="Criar player" icon="pi pi-id-card" :loading="creatingPlayer" />
            </div>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { getErrorMessage } from '@/services/error'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'

const auth = useAuthStore()
const playerStore = usePlayerStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const displayName = ref('')
const creatingPlayer = ref(false)
const loggingOut = ref(false)

onMounted(async () => {
  await auth.fetchSession()
  await playerStore.fetchMyPlayer().catch(() => null)

  if (route.query.bootstrap === 'player' && auth.state.user?.username && !displayName.value) {
    displayName.value = auth.state.user.username
  }
})

async function createPlayerProfile() {
  creatingPlayer.value = true

  try {
    await playerStore.createMyPlayer({ displayName: displayName.value })
    toast.add({
      severity: 'success',
      summary: 'Player criado',
      detail: 'Agora voce ja pode cadastrar decks e entrar em eventos.',
      life: 3000,
    })

    await router.push(route.query.redirect || '/decks')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Falha ao criar player',
      detail: getErrorMessage(error, 'Nao foi possivel criar o player.'),
      life: 4000,
    })
  } finally {
    creatingPlayer.value = false
  }
}

async function logout() {
  loggingOut.value = true
  try {
    await auth.logout()
    toast.add({ severity: 'success', summary: 'Sessao encerrada', detail: 'Voce foi redirecionado para o login.', life: 2500 })
    await router.push('/login')
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Falha ao sair', detail: getErrorMessage(error, 'Nao foi possivel encerrar a sessao.'), life: 4000 })
  } finally {
    loggingOut.value = false
  }
}
</script>
