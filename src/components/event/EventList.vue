<template>
  <div class="page-shell page-shell--wide events-page-shell">
    <div class="w-full flex flex-column gap-5">
      <div class="events-topbar flex justify-content-between align-items-start flex-wrap gap-3">
        <div class="flex flex-column gap-2">
          <span class="events-eyebrow">Calendario competitivo</span>
          <h2 class="m-0 page-title">Eventos</h2>
        </div>
        <Button class="events-create-btn" label="Criar evento" icon="pi pi-plus" @click="$router.push('/events/create')" />
      </div>


      <div v-if="loading" class="text-center py-5">Carregando eventos...</div>
      <div v-else class="flex flex-column gap-5">
        <section class="events-section">
          <div class="events-section__header">
            <div class="events-section__title-wrap">
              <h3 class="events-section__title">Proximos eventos</h3>
              <div class="events-section__line"></div>
            </div>
            <Tag :value="`${upcomingEvents.length} card(s)`" severity="info" />
          </div>

          <Message v-if="!upcomingEvents.length" severity="info" :closable="false">
            Nenhum proximo evento encontrado.
          </Message>
          <div v-else class="events-grid">
            <article v-for="event in upcomingEvents" :key="event._id" class="event-showcase-card event-showcase-card--upcoming">
              <div class="event-showcase-card__body">
                <div class="event-showcase-card__top">
                  <div class="flex flex-column gap-2">
                    <div class="flex gap-2 flex-wrap align-items-center">
                      <Tag :value="event.statusLabel" :severity="event.status === 'ONGOING' ? 'success' : 'info'" />
                      <Tag :value="event.gameModeLabel" severity="warn" />
                      <Tag v-if="isOrganizer(event)" value="Organizador" severity="success" />
                    </div>
                    <h4 class="event-showcase-card__title">{{ event.name }}</h4>
                    <p class="event-showcase-card__subtitle">{{ event.gameModeLabel }} - {{ event.pairingTypeLabel }}</p>
                  </div>
                </div>

                <div class="event-showcase-card__meta">
                  <div class="event-meta-row">
                    <i class="pi pi-calendar"></i>
                    <span>{{ formatDateTime(event.dateTime) }}</span>
                  </div>
                  <div class="event-meta-row">
                    <i class="pi pi-sitemap"></i>
                    <span>{{ event.pairingTypeLabel }}</span>
                  </div>
                  <div class="event-meta-row">
                    <i class="pi pi-users"></i>
                    <span>{{ event.qntPlayers || 0 }} player(s)</span>
                  </div>
                </div>

                <p class="event-showcase-card__description">{{ event.description || 'Sem descricao cadastrada para este evento.' }}</p>

                <div class="event-showcase-card__footer">
                  <Button label="Ver evento" icon="pi pi-arrow-right" @click="$router.push(`/events/${event._id}`)" />
                </div>
              </div>
            </article>
          </div>
        </section>

        <section class="events-section">
          <div class="events-section__header">
            <div class="events-section__title-wrap">
              <h3 class="events-section__title">Eventos passados</h3>
              <div class="events-section__line"></div>
            </div>
            <Tag :value="`${pastEvents.length} card(s)`" severity="contrast" />
          </div>

          <Message v-if="!pastEvents.length" severity="info" :closable="false">
            Nenhum evento finalizado, completo ou cancelado ainda.
          </Message>
          <div v-else class="events-grid">
            <article v-for="event in pastEvents" :key="event._id" class="event-showcase-card event-showcase-card--past">
              <div class="event-showcase-card__body">
                <div class="event-showcase-card__top">
                  <div class="flex flex-column gap-2">
                    <div class="flex gap-2 flex-wrap align-items-center">
                      <Tag :value="event.statusLabel" :severity="event.status === 'CANCELLED' ? 'danger' : 'contrast'" />
                      <Tag :value="event.gameModeLabel" severity="warn" />
                    </div>
                    <h4 class="event-showcase-card__title">{{ event.name }}</h4>
                    <p class="event-showcase-card__subtitle">{{ event.gameModeLabel }} - {{ event.pairingTypeLabel }}</p>
                  </div>
                </div>

                <div class="event-showcase-card__meta">
                  <div class="event-meta-row">
                    <i class="pi pi-calendar"></i>
                    <span>{{ formatDateTime(event.dateTime) }}</span>
                  </div>
                  <div class="event-meta-row">
                    <i class="pi pi-sitemap"></i>
                    <span>{{ event.pairingTypeLabel }}</span>
                  </div>
                  <div class="event-meta-row">
                    <i class="pi pi-users"></i>
                    <span>{{ event.qntPlayers || 0 }} player(s)</span>
                  </div>
                </div>

                <p class="event-showcase-card__description">{{ event.description || 'Sem descricao cadastrada para este evento.' }}</p>

                <div class="event-showcase-card__footer">
                  <Button label="Ver detalhes" icon="pi pi-eye" severity="secondary" @click="$router.push(`/events/${event._id}`)" />
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { EVENT_GAME_MODE_LABELS, EVENT_PAIRING_LABELS, EVENT_STATUS_LABELS } from '@/constants/options'
import { listEvents } from '@/services/events'
import { getErrorMessage } from '@/services/error'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const toast = useToast()
const loading = ref(false)
const events = ref([])

const pastStatuses = new Set(['FINISHED', 'COMPLETED', 'CANCELLED'])

const normalizedEvents = computed(() => events.value.map((event) => ({
  ...event,
  gameModeLabel: EVENT_GAME_MODE_LABELS[event.gameMode] || event.gameMode,
  pairingTypeLabel: EVENT_PAIRING_LABELS[event.pairingType] || event.pairingType,
  statusLabel: EVENT_STATUS_LABELS[event.status] || event.status,
})))

const upcomingEvents = computed(() => normalizedEvents.value
  .filter((event) => !pastStatuses.has(event.status))
  .sort((left, right) => new Date(left.dateTime || 0) - new Date(right.dateTime || 0)))

const pastEvents = computed(() => normalizedEvents.value
  .filter((event) => pastStatuses.has(event.status))
  .sort((left, right) => new Date(right.dateTime || 0) - new Date(left.dateTime || 0)))

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString('pt-BR') : '-'
}

function isOrganizer(event) {
  return auth.state.user?.id && auth.state.user.id === event.createdByUserId
}

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await listEvents()
    events.value = data
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: getErrorMessage(error, 'Nao foi possivel carregar os eventos.'), life: 4000 })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.events-page-shell {
  align-items: stretch;
}

.events-eyebrow {
  color: #bfdbfe;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.72rem;
  font-weight: 700;
}

.events-section {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.events-section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.events-section__title-wrap {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 58rem;
}

.events-section__title {
  margin: 0;
  color: #f8fafc;
  font-size: clamp(1.5rem, 2.2vw, 2rem);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.events-section__line {
  height: 2px;
  flex: 1;
  background: rgba(226, 232, 240, 0.8);
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
}

.event-showcase-card {
  min-height: 100%;
  border-radius: 22px;
  border: 2px solid rgba(0, 0, 0, 0.9);
  background: #202d41;
  box-shadow: 0 8px 0 rgba(0, 0, 0, 0.92);
  overflow: hidden;
}

.event-showcase-card--upcoming {
  background: linear-gradient(180deg, rgba(31, 41, 55, 0.96) 0%, rgba(30, 41, 59, 0.98) 100%);
}

.event-showcase-card--past {
  background: linear-gradient(180deg, rgba(39, 49, 63, 0.94) 0%, rgba(30, 41, 59, 0.98) 100%);
}

.event-showcase-card__body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  padding: 1.15rem 1.1rem 1.25rem;
}

.event-showcase-card__title {
  margin: 0;
  color: #f8fafc;
  font-size: 1.55rem;
  line-height: 1.02;
  font-weight: 900;
  text-transform: uppercase;
}

.event-showcase-card__subtitle {
  margin: 0;
  color: #dbe6f3;
  font-size: 1rem;
  font-weight: 600;
}

.event-showcase-card__meta {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  color: #e2e8f0;
}

.event-meta-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 0.98rem;
  font-weight: 600;
}

.event-meta-row i {
  color: #d9f99d;
  font-size: 0.95rem;
}

.event-showcase-card__description {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.55;
  flex: 1;
}

.event-showcase-card__footer {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}

.event-showcase-card__footer :deep(.p-button) {
  border-radius: 12px;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.55);
}

@media (max-width: 1100px) {
  .events-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .events-topbar {
    align-items: stretch !important;
  }

  .events-create-btn {
    width: 100%;
  }

  .events-grid {
    grid-template-columns: 1fr;
  }

  .events-section__title-wrap {
    max-width: none;
  }

  .events-section__title {
    white-space: normal;
  }

  .event-showcase-card__body {
    padding: 1rem;
  }

  .event-showcase-card__title {
    font-size: 1.3rem;
    line-height: 1.08;
  }

  .event-showcase-card__subtitle,
  .event-meta-row {
    font-size: 0.92rem;
  }

  .event-showcase-card__footer :deep(.p-button) {
    width: 100%;
  }
}
</style>
