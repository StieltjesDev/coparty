<template>
  <div class="page-shell profile-page-shell">
    <div class="page-card profile-page">
      <section class="profile-hero app-panel">
        <div class="profile-hero__identity">
          <div class="profile-avatar">{{ profileInitial }}</div>
          <div class="flex flex-column gap-2">
            <span class="profile-eyebrow">Perfil do usuario</span>
            <h1 class="profile-title">{{ auth.state.user?.username || 'Minha conta' }}</h1>
            <p class="profile-subtitle">
              Centralize seus dados da conta e acompanhe o status do seu player sem precisar navegar por varias telas.
            </p>
          </div>
        </div>

        <div class="profile-hero__meta">
          <div class="profile-chip">
            <span class="profile-chip__label">Role</span>
            <Tag :value="auth.state.user?.role || 'guest'" :severity="auth.state.user?.role === 'admin' ? 'danger' : 'info'" />
          </div>

          <div class="profile-chip">
            <span class="profile-chip__label">Player</span>
            <Tag :value="playerStore.state.player ? 'Ativo' : 'Pendente'" :severity="playerStore.state.player ? 'success' : 'warn'" />
          </div>
        </div>
      </section>

      <div class="profile-grid">
        <Card class="form-card profile-card">
          <template #content>
            <div v-if="auth.state.loading" class="text-center py-6">Carregando sessao...</div>
            <form v-else class="flex flex-column gap-4" @submit.prevent="saveUserProfile">
              <div class="profile-section-head">
                <div>
                  <h2 class="profile-section-title">Dados da conta</h2>
                  <p class="profile-section-copy">
                    O nome de usuario tambem define o display name do seu player dentro do sistema.
                  </p>
                </div>
              </div>

              <div class="profile-highlight">
                <div>
                  <span class="profile-highlight__label">Display name sincronizado</span>
                  <strong>{{ auth.state.user?.username || '-' }}</strong>
                </div>
                <small>Quando voce alterar o usuario, o player sera atualizado junto.</small>
              </div>

              <div class="grid">
                <div class="col-12 md:col-6">
                  <FloatLabel variant="on">
                    <InputText id="username" v-model.trim="profileForm.username" fluid />
                    <label for="username">Usuario</label>
                  </FloatLabel>
                </div>

                <div class="col-12 md:col-6">
                  <FloatLabel variant="on">
                    <InputText id="email" v-model.trim="profileForm.email" fluid />
                    <label for="email">E-mail</label>
                  </FloatLabel>
                </div>
              </div>

              <div class="profile-info-grid">
                <div class="profile-info-card">
                  <span>Status da sessao</span>
                  <strong>{{ auth.state.isAuthenticated ? 'Autenticado' : 'Nao autenticado' }}</strong>
                </div>
                <div class="profile-info-card">
                  <span>E-mail atual</span>
                  <strong>{{ auth.state.user?.email || 'Nao informado' }}</strong>
                </div>
              </div>

              <Message :severity="auth.state.user?.email ? 'secondary' : 'warn'" :closable="false">
                {{ auth.state.user?.email
                  ? 'O e-mail pode ser alterado desde que ainda nao exista outro igual na base.'
                  : 'Sua conta e legada e ainda nao possui e-mail. Informe um e-mail unico para completar o perfil.' }}
              </Message>

              <div class="profile-actions">
                <Button type="button" label="Encerrar sessao" icon="pi pi-sign-out" severity="secondary" :loading="loggingOut" @click="logout" />
                <Button type="submit" label="Salvar perfil" icon="pi pi-save" :loading="savingProfile" />
              </div>
            </form>
          </template>
        </Card>

        <Card class="form-card profile-card">
          <template #content>
            <div v-if="playerStore.state.loading" class="text-center py-6">Carregando player...</div>
            <div v-else class="flex flex-column gap-4">
              <div class="profile-section-head">
                <div>
                  <h2 class="profile-section-title">Espaco do player</h2>
                  <p class="profile-section-copy">
                    Aqui voce acompanha rapidamente se seu perfil competitivo ja esta pronto para decks e eventos.
                  </p>
                </div>
              </div>

              <div v-if="playerStore.state.player" class="flex flex-column gap-4">
                <div class="profile-stats-grid">
                  <div class="profile-stat-card">
                    <span>Pontos</span>
                    <strong>{{ playerStore.state.player.points }}</strong>
                  </div>
                  <div class="profile-stat-card">
                    <span>Vitorias</span>
                    <strong>{{ playerStore.state.player.wins }}</strong>
                  </div>
                  <div class="profile-stat-card">
                    <span>Derrotas</span>
                    <strong>{{ playerStore.state.player.losses }}</strong>
                  </div>
                  <div class="profile-stat-card">
                    <span>Empates</span>
                    <strong>{{ playerStore.state.player.draws }}</strong>
                  </div>
                </div>
              </div>

              <form v-else class="flex flex-column gap-3" @submit.prevent="createPlayerProfile">
                <Message severity="warn" :closable="false">
                  Voce ainda nao criou seu player. Sem ele, nao da para cadastrar decks nem entrar em eventos.
                </Message>

                <div class="profile-empty-state">
                  <strong>Um clique para liberar o restante do sistema.</strong>
                  <p>
                    O player sera criado automaticamente com o mesmo nome de usuario da sua conta, sem precisar preencher mais nada.
                  </p>
                </div>

                <div class="flex justify-content-end">
                  <Button type="submit" label="Criar player" icon="pi pi-id-card" :loading="creatingPlayer" />
                </div>
              </form>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
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

const profileForm = reactive({
  username: '',
  email: '',
})
const creatingPlayer = ref(false)
const loggingOut = ref(false)
const savingProfile = ref(false)

const profileInitial = computed(() => (auth.state.user?.username?.charAt(0) || 'U').toUpperCase())

onMounted(async () => {
  await auth.fetchSession()
  await playerStore.fetchMyPlayer().catch(() => null)
  syncProfileForm()
})

async function createPlayerProfile() {
  creatingPlayer.value = true

  try {
    await playerStore.createMyPlayer({})
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

async function saveUserProfile() {
  savingProfile.value = true

  try {
    if (!profileForm.email.trim()) {
      throw new Error('Informe um e-mail para salvar o perfil.')
    }

    const updatedUser = await auth.updateCurrentUser({
      username: profileForm.username,
      email: profileForm.email.trim(),
    })

    profileForm.username = updatedUser?.username || ''
    profileForm.email = updatedUser?.email || ''

    if (playerStore.state.player) {
      await playerStore.fetchMyPlayer(true).catch(() => null)
    }

    toast.add({
      severity: 'success',
      summary: 'Perfil atualizado',
      detail: 'Seus dados da conta foram salvos com sucesso.',
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Falha ao salvar perfil',
      detail: getErrorMessage(error, 'Nao foi possivel atualizar seus dados.'),
      life: 4000,
    })
  } finally {
    savingProfile.value = false
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

function syncProfileForm() {
  profileForm.username = auth.state.user?.username || ''
  profileForm.email = auth.state.user?.email || ''
}
</script>

<style scoped>
.profile-page-shell {
  align-items: stretch;
}

.profile-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.profile-hero {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.75rem;
  border-radius: 28px;
}

.profile-hero__identity {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-avatar {
  width: 4.5rem;
  height: 4.5rem;
  display: grid;
  place-items: center;
  border-radius: 1.4rem;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(14, 165, 233, 0.45));
  color: #f8fafc;
  font-size: 1.9rem;
  font-weight: 700;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
}

.profile-eyebrow {
  color: rgba(191, 219, 254, 0.82);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.72rem;
  font-weight: 700;
}

.profile-title {
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  line-height: 1.05;
  color: #f8fafc;
}

.profile-subtitle {
  margin: 0;
  max-width: 40rem;
  color: var(--app-text-soft);
  line-height: 1.6;
}

.profile-hero__meta {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: flex-end;
  gap: 0.85rem;
}

.profile-chip {
  min-width: 9.5rem;
  padding: 0.85rem 1rem;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(148, 163, 184, 0.18);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-chip__label {
  font-size: 0.78rem;
  color: var(--app-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

.profile-card {
  height: 100%;
}

.profile-section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.profile-section-title {
  margin: 0;
  font-size: 1.2rem;
  color: #f8fafc;
}

.profile-section-copy {
  margin: 0.4rem 0 0;
  color: var(--app-text-soft);
  line-height: 1.55;
}

.profile-highlight {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(15, 23, 42, 0.32));
  border: 1px solid rgba(56, 189, 248, 0.18);
}

.profile-highlight--success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.14), rgba(15, 23, 42, 0.32));
  border-color: rgba(34, 197, 94, 0.22);
}

.profile-highlight__label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(191, 219, 254, 0.88);
}

.profile-highlight strong,
.profile-info-card strong,
.profile-stat-card strong {
  color: #f8fafc;
}

.profile-highlight small {
  display: block;
  max-width: 13rem;
  color: var(--app-text-soft);
  line-height: 1.45;
}

.profile-info-grid,
.profile-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.profile-info-card,
.profile-stat-card,
.profile-empty-state {
  padding: 1rem 1.1rem;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.profile-info-card span,
.profile-stat-card span {
  display: block;
  margin-bottom: 0.4rem;
  color: var(--app-text-soft);
  font-size: 0.84rem;
}

.profile-stat-card strong {
  font-size: 1.55rem;
}

.profile-empty-state strong {
  display: block;
  margin-bottom: 0.35rem;
  color: #f8fafc;
}

.profile-empty-state p {
  margin: 0;
  color: var(--app-text-soft);
  line-height: 1.55;
}

.profile-actions {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (max-width: 960px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .profile-hero {
    flex-direction: column;
  }

  .profile-hero__meta {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .profile-page {
    gap: 1rem;
  }

  .profile-hero {
    padding: 1.2rem;
  }

  .profile-hero__identity {
    align-items: flex-start;
  }

  .profile-avatar {
    width: 3.75rem;
    height: 3.75rem;
    font-size: 1.5rem;
  }

  .profile-highlight,
  .profile-section-head,
  .profile-actions {
    flex-direction: column;
  }

  .profile-highlight small {
    max-width: none;
  }

  .profile-info-grid,
  .profile-stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
