<template>
  <div class="page-shell page-shell--wide">
    <div class="w-full flex flex-column gap-4">
      <Card class="form-card">
        <template #title>
          <div class="flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <div class="flex gap-2 align-items-center flex-wrap">
                <h2 class="m-0">{{ event?.name || 'Evento' }}</h2>
                <Tag v-if="canManageEvent" :value="auth.state.user?.role === 'admin' ? 'Admin' : 'Organizador'" :severity="auth.state.user?.role === 'admin' ? 'danger' : 'success'" />
                <Tag v-if="event" :value="eventStatusLabel" :severity="event.status === 'SCHEDULED' ? 'info' : event.status === 'ONGOING' ? 'success' : event.status === 'CANCELLED' ? 'danger' : 'contrast'" />
              </div>
              <small>{{ eventGameModeLabel }} - {{ eventPairingTypeLabel }} - {{ eventFormatLabel }}</small>
            </div>
            <div v-if="event" class="flex gap-2 flex-wrap">
              <Button label="Voltar" severity="secondary" @click="$router.push('/events')" />
              <Button v-if="canEditEvent" label="Editar evento" icon="pi pi-pencil" @click="$router.push(`/events/${event._id}/edit`)" />
              <Button v-if="canStartEvent" label="Iniciar evento" icon="pi pi-play" severity="success" :loading="actionLoading" @click="startCurrentEvent" />
              <Button v-if="canCancelEvent" label="Cancelar evento" icon="pi pi-times" severity="warning" :loading="actionLoading" @click="cancelCurrentEvent" />
              <Button v-if="canFinishEvent" label="Finalizar evento" icon="pi pi-flag" severity="danger" :loading="actionLoading" @click="finishCurrentEvent" />
            </div>
          </div>
        </template>
        <template #content>
          <div v-if="loadingEvent" class="text-center py-4">Carregando evento...</div>
          <div v-else-if="event" class="flex flex-column gap-4">
            <div class="app-highlight-grid">
              <div class="app-highlight app-highlight--accent">
                <div>
                  <span class="app-highlight-label">Agenda</span>
                  <strong class="app-highlight-title">{{ formatDateTime(event.dateTime) }}</strong>
                </div>
                <p class="app-highlight-copy">Horario oficial do torneio para inscricoes, pareamentos e acompanhamento da rodada.</p>
              </div>
              <div class="app-highlight">
                <div>
                  <span class="app-highlight-label">Capacidade</span>
                  <strong class="app-highlight-title">{{ event.maxPlayers || 'Livre' }}</strong>
                </div>
                <p class="app-highlight-copy">{{ entries.length }} inscrito(s) neste momento.</p>
              </div>
              <div class="app-highlight">
                <div>
                  <span class="app-highlight-label">Formato oficial</span>
                  <strong class="app-highlight-title">{{ eventFormatLabel }}</strong>
                </div>
                <p class="app-highlight-copy">A inscricao aceita apenas decks ativos nesse formato.</p>
              </div>
            </div>

            <div class="app-highlight">
              <div>
                <span class="app-highlight-label">Descricao do evento</span>
                <strong class="app-highlight-title">{{ eventGameModeLabel }} - {{ eventPairingTypeLabel }}</strong>
              </div>
              <p class="app-highlight-copy">{{ event.description || 'Sem descricao cadastrada para este evento.' }}</p>
            </div>
          </div>
        </template>
      </Card>

      <Card v-if="event" class="form-card">
        <template #title>Inscricao no evento</template>
        <template #content>
          <Message v-if="!auth.state.user" severity="warn" :closable="false">Faca login para entrar no evento.</Message>
          <Message v-else-if="!playerStore.state.player" severity="warn" :closable="false">Crie seu player antes de entrar em eventos.</Message>
          <Message v-else-if="!registrationOpen" severity="secondary" :closable="false">{{ registrationClosedMessage }}</Message>
          <Message v-else-if="!myDecks.length && !myEntry" severity="warn" :closable="false">Voce precisa cadastrar pelo menos um deck antes de entrar no evento.</Message>
          <div v-else-if="myEntry" class="flex flex-column gap-3">
            <div :class="['app-highlight', myEntry.status === 'DROPPED' ? '' : 'app-highlight--success']">
              <div>
                <span class="app-highlight-label">{{ myEntry.status === 'DROPPED' ? 'Inscricao encerrada' : 'Inscricao confirmada' }}</span>
                <strong class="app-highlight-title">{{ myEntry.status === 'DROPPED' ? 'Voce foi dropado deste evento' : 'Voce ja esta neste evento' }}</strong>
              </div>
              <p class="app-highlight-copy">Deck atual: <strong>{{ myEntry.deckId?.name || myEntry.deckId }}</strong>.</p>
            </div>
            <div v-if="myEntry.status !== 'DROPPED'" class="flex justify-content-end">
              <Button label="Cancelar inscricao" severity="danger" :loading="joining" :disabled="!registrationOpen" @click="leaveCurrentEvent" />
            </div>
          </div>
          <div v-else class="flex flex-column gap-3">
            <div class="app-highlight app-highlight--accent">
              <div>
                <span class="app-highlight-label">Pronto para entrar</span>
                <strong class="app-highlight-title">Escolha um deck ativo para {{ eventFormatLabel }}</strong>
              </div>
              <p class="app-highlight-copy">O sistema filtra automaticamente seus decks para mostrar apenas os compativeis com o formato do evento.</p>
            </div>
            <Message v-if="!compatibleDecks.length" severity="warn" :closable="false">
              {{ missingCompatibleDecksMessage }}
            </Message>
            <FloatLabel v-else variant="on">
              <Select id="deckId" v-model="selectedDeckId" :options="deckOptions" optionLabel="label" optionValue="value" fluid />
              <label for="deckId">Escolha o deck</label>
            </FloatLabel>
            <div class="flex justify-content-end">
              <Button label="Entrar no evento" icon="pi pi-user-plus" :loading="joining" :disabled="!deckOptions.length || !registrationOpen" @click="joinCurrentEvent" />
            </div>
          </div>
        </template>
      </Card>

      <Card v-if="event" class="form-card">
        <template #title>Inscricoes</template>
        <template #content>
          <Message v-if="!entries.length" severity="info" :closable="false">Nenhum inscrito ainda.</Message>
          <div v-else class="table-surface">
            <DataTable :value="entries" dataKey="_id" stripedRows>
              <Column field="playerId.displayName" header="Player" />
              <Column field="deckId.name" header="Deck" />
              <Column header="Formato">
                <template #body="{ data }">{{ formatDeckFormat(data.deckId?.format) }}</template>
              </Column>
              <Column header="Status">
                <template #body="{ data }">{{ formatEntryStatus(data.status) }}</template>
              </Column>
              <Column v-if="canManageEvent" header="Acoes" style="width: 9rem">
                <template #body="{ data }">
                  <Button
                    v-if="canDropEntry(data)"
                    size="small"
                    label="Drop"
                    severity="warning"
                    :loading="droppingEntryId === data._id"
                    @click="dropCurrentEntry(data)"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
        </template>
      </Card>

      <Card v-if="event" class="form-card">
        <template #title>
          <div class="flex justify-content-between align-items-center flex-wrap gap-3">
            <span>Rodadas e matches</span>
            <div class="flex gap-2 align-items-center flex-wrap">
              <FloatLabel variant="on">
                <InputNumber id="round" v-model="selectedRound" :min="1" inputStyle="width: 6rem" />
                <label for="round">Rodada</label>
              </FloatLabel>
              <Button label="Pesquisar" severity="secondary" @click="loadRoundMatches" />
              <Button v-if="canManageRounds" :label="`Gerar rodada ${nextRoundNumber}`" icon="pi pi-sync" :loading="roundLoading" @click="generateSelectedRound" />
            </div>
          </div>
        </template>
        <template #content>
          <Message v-if="!canManageEvent" severity="secondary" :closable="false">Visualizacao liberada. Geracao e fechamento de rodada sao exclusivos do organizador ou admin.</Message>
          <Message v-if="!roundMatches.length" severity="info" :closable="false">Nenhuma match carregada para essa rodada.</Message>
          <div v-else class="flex flex-column gap-3">
            <div class="table-surface">
              <DataTable :value="roundMatches" dataKey="_id" stripedRows paginator :rows="5" :rowsPerPageOptions="[5, 10, 20]" paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown">
                <Column field="tableNumber" header="Mesa" />
                <Column field="status" header="Status" />
                <Column header="Participantes">
                  <template #body="{ data }">
                    {{ formatParticipants(data.participants) }}
                  </template>
                </Column>
                <Column header="Acoes" style="width: 10rem">
                  <template #body="{ data }">
                    <Button size="small" label="Abrir" @click="$router.push(`/matches/${data._id}`)" />
                  </template>
                </Column>
              </DataTable>
            </div>
            <div v-if="canManageRounds" class="flex justify-content-end">
              <Button label="Fechar rodada" icon="pi pi-check" severity="success" :loading="roundLoading" :disabled="!roundMatches.length" @click="closeSelectedRound" />
            </div>
          </div>
        </template>
      </Card>

      <Card v-if="event" class="form-card">
        <template #title>Standings</template>
        <template #content>
          <Message v-if="!standings.length" severity="info" :closable="false">Ainda nao ha standings para este evento.</Message>
          <div v-else class="table-surface">
            <DataTable :value="standings" dataKey="eventEntryId" stripedRows>
              <Column field="position" header="#" />
              <Column field="player.displayName" header="Player" />
              <Column field="deck.name" header="Deck" />
              <Column field="points" header="Pontos" />
              <Column field="wins" header="Wins" />
              <Column field="losses" header="Losses" />
              <Column field="draws" header="Draws" />
              <Column field="byes" header="Byes" />
              <Column field="buchholz" header="Buchholz" />
              <Column header="OMW%">
                <template #body="{ data }">{{ formatPercent(data.opponentMatchWinRate) }}</template>
              </Column>
            </DataTable>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import FloatLabel from 'primevue/floatlabel'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { DECK_FORMAT_LABELS, EVENT_ENTRY_STATUS_LABELS, EVENT_GAME_MODE_LABELS, EVENT_PAIRING_LABELS, EVENT_STATUS_LABELS } from '@/constants/options'
import { listMyDecks } from '@/services/decks'
import { getErrorMessage } from '@/services/error'
import {
  cancelEvent as cancelEventRequest,
  closeRound,
  finishEvent as finishEventRequest,
  generateRound,
  getEvent,
  getEventEntries,
  getEventMatches,
  getRound,
  getStandings,
  joinEvent,
  leaveEvent,
  dropEventEntry as dropEventEntryRequest,
  startEvent as startEventRequest,
} from '@/services/events'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'

const route = useRoute()
const toast = useToast()
const auth = useAuthStore()
const playerStore = usePlayerStore()

const loadingEvent = ref(false)
const joining = ref(false)
const roundLoading = ref(false)
const actionLoading = ref(false)
const droppingEntryId = ref(null)
const event = ref(null)
const entries = ref([])
const standings = ref([])
const roundMatches = ref([])
const eventMatches = ref([])
const myDecks = ref([])
const selectedDeckId = ref(null)
const selectedRound = ref(1)

const canManageEvent = computed(() => {
  if (!event.value || !auth.state.user) return false
  return auth.state.user.role === 'admin' || auth.state.user.id === event.value.createdByUserId
})

const eventStatusLabel = computed(() => EVENT_STATUS_LABELS[event.value?.status] || event.value?.status || '-')
const eventGameModeLabel = computed(() => EVENT_GAME_MODE_LABELS[event.value?.gameMode] || event.value?.gameMode || '-')
const eventPairingTypeLabel = computed(() => EVENT_PAIRING_LABELS[event.value?.pairingType] || event.value?.pairingType || '-')
const eventFormatLabel = computed(() => formatDeckFormat(event.value?.format))
const eventRequiresFormat = computed(() => Boolean(event.value?.format))
const compatibleDecks = computed(() => myDecks.value.filter((deck) => isDeckCompatible(deck)))
const missingCompatibleDecksMessage = computed(() => eventRequiresFormat.value
  ? `Voce nao possui um deck ativo no formato ${eventFormatLabel.value} para este evento.`
  : 'Voce nao possui nenhum deck ativo disponivel para este evento.')
const deckOptions = computed(() => compatibleDecks.value.map((deck) => ({
  label: `${deck.name} (${formatDeckFormat(deck.format)})`,
  value: deck._id,
})))

const registrationOpen = computed(() => ['DRAFT', 'SCHEDULED'].includes(event.value?.status))
const registrationClosedMessage = computed(() => {
  switch (event.value?.status) {
    case 'ONGOING':
      return 'Inscricoes encerradas. O evento ja esta em andamento.'
    case 'FINISHED':
    case 'COMPLETED':
      return 'Inscricoes encerradas. Este evento ja foi finalizado.'
    case 'CANCELLED':
      return 'Inscricoes encerradas. Este evento foi cancelado.'
    default:
      return 'Inscricoes encerradas para este evento.'
  }
})
const nextRoundNumber = computed(() => {
  const rounds = eventMatches.value.map((match) => Number(match.round)).filter(Number.isFinite)
  return (rounds.length ? Math.max(...rounds) : 0) + 1
})
const canEditEvent = computed(() => canManageEvent.value && registrationOpen.value)
const canManageRounds = computed(() => canManageEvent.value && event.value?.status === 'ONGOING')
const canFinishEvent = computed(() => canManageEvent.value && event.value?.status === 'ONGOING')
const canStartEvent = computed(() => canManageEvent.value && event.value?.status === 'SCHEDULED')
const canCancelEvent = computed(() => canManageEvent.value && ['DRAFT', 'SCHEDULED'].includes(event.value?.status))

const myEntry = computed(() => {
  const playerId = playerStore.state.player?._id
  if (!playerId) return null

  return entries.value.find((entry) => {
    const entryPlayerId = entry.playerId?._id || entry.playerId
    return String(entryPlayerId) === String(playerId)
  }) || null
})

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString('pt-BR') : '-'
}

function formatDeckFormat(value) {
  return DECK_FORMAT_LABELS[value] || value || 'Formato livre'
}

function formatEntryStatus(value) {
  return EVENT_ENTRY_STATUS_LABELS[value] || value || '-'
}

function canDropEntry(entry) {
  return canManageEvent.value
    && ['DRAFT', 'SCHEDULED', 'ONGOING'].includes(event.value?.status)
    && entry?.status !== 'DROPPED'
}

function isDeckCompatible(deck) {
  if (!deck?.isActive) return false
  if (!event.value?.format) return true
  return deck.format === event.value.format
}

function formatParticipants(participants = []) {
  return participants
    .map((participant) => participant.eventEntryId?.playerId?.displayName || 'Participante')
    .join(' x ')
}

function formatPercent(value) {
  return `${((value || 0) * 100).toFixed(1)}%`
}

async function loadEventPage() {
  loadingEvent.value = true
  try {
    await auth.fetchSession().catch(() => null)
    if (auth.state.user) {
      await playerStore.fetchMyPlayer().catch(() => null)
      const decksResponse = await listMyDecks().catch(() => ({ data: [] }))
      myDecks.value = decksResponse.data || []
    }

    const [eventResponse, entriesResponse, standingsResponse, matchesResponse] = await Promise.all([
      getEvent(route.params.id),
      getEventEntries(route.params.id),
      getStandings(route.params.id).catch(() => ({ data: [] })),
      getEventMatches(route.params.id).catch(() => ({ data: [] })),
    ])

    event.value = eventResponse.data
    entries.value = entriesResponse.data
    standings.value = standingsResponse.data || []
    eventMatches.value = matchesResponse.data || []
    selectedDeckId.value = compatibleDecks.value[0]?._id || null

    if (eventMatches.value.length && !eventMatches.value.some((match) => Number(match.round) === selectedRound.value)) {
      selectedRound.value = Math.max(nextRoundNumber.value - 1, 1)
    }

    await loadRoundMatches()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: getErrorMessage(error, 'Nao foi possivel carregar o evento.'), life: 4000 })
  } finally {
    loadingEvent.value = false
  }
}

async function refreshEntriesAndStandings() {
  const [entriesResponse, standingsResponse, matchesResponse] = await Promise.all([
    getEventEntries(route.params.id),
    getStandings(route.params.id).catch(() => ({ data: [] })),
    getEventMatches(route.params.id).catch(() => ({ data: [] })),
  ])
  entries.value = entriesResponse.data
  standings.value = standingsResponse.data || []
  eventMatches.value = matchesResponse.data || []
}

async function joinCurrentEvent() {
  if (!registrationOpen.value) {
    toast.add({ severity: 'warn', summary: 'Inscricoes encerradas', detail: 'Este evento nao aceita mais inscricoes.', life: 3000 })
    return
  }

  if (!selectedDeckId.value) {
    toast.add({ severity: 'warn', summary: 'Deck obrigatorio', detail: 'Selecione um deck compativel para entrar no evento.', life: 3000 })
    return
  }

  joining.value = true
  try {
    await joinEvent(route.params.id, { deckId: selectedDeckId.value })
    toast.add({ severity: 'success', summary: 'Inscricao realizada', detail: 'Voce entrou no evento.', life: 2500 })
    await refreshEntriesAndStandings()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Falha na inscricao', detail: getErrorMessage(error, 'Nao foi possivel entrar no evento.'), life: 4000 })
  } finally {
    joining.value = false
  }
}

async function leaveCurrentEvent() {
  if (!registrationOpen.value) {
    toast.add({ severity: 'warn', summary: 'Inscricoes encerradas', detail: 'Nao e mais possivel cancelar inscricao neste evento.', life: 3000 })
    return
  }

  joining.value = true
  try {
    await leaveEvent(route.params.id)
    toast.add({ severity: 'success', summary: 'Inscricao cancelada', detail: 'Voce saiu do evento.', life: 2500 })
    await refreshEntriesAndStandings()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Falha ao sair', detail: getErrorMessage(error, 'Nao foi possivel cancelar a inscricao.'), life: 4000 })
  } finally {
    joining.value = false
  }
}

async function dropCurrentEntry(entry) {
  if (!canDropEntry(entry)) return

  const confirmed = window.confirm(`Deseja aplicar drop em ${entry.playerId?.displayName || 'este inscrito'}? Ele saira dos proximos pareamentos, mas continuara nos standings.`)
  if (!confirmed) return

  droppingEntryId.value = entry._id
  try {
    await dropEventEntryRequest(route.params.id, entry._id)
    toast.add({ severity: 'success', summary: 'Drop aplicado', detail: 'O inscrito nao sera pareado nas proximas rodadas.', life: 3000 })
    await refreshEntriesAndStandings()
    await loadRoundMatches()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Falha ao aplicar drop', detail: getErrorMessage(error, 'Nao foi possivel aplicar drop nesta inscricao.'), life: 4000 })
  } finally {
    droppingEntryId.value = null
  }
}

async function loadRoundMatches() {
  try {
    const { data } = await getRound(route.params.id, selectedRound.value)
    roundMatches.value = data
  } catch {
    roundMatches.value = []
  }
}

async function generateSelectedRound() {
  if (!canManageRounds.value) {
    toast.add({ severity: 'warn', summary: 'Rodada bloqueada', detail: 'So e possivel gerar rodadas em eventos em andamento.', life: 3000 })
    return
  }

  roundLoading.value = true
  try {
    const roundToGenerate = nextRoundNumber.value
    const { data } = await generateRound(route.params.id, roundToGenerate)
    selectedRound.value = roundToGenerate
    roundMatches.value = data
    await refreshEntriesAndStandings()
    toast.add({ severity: 'success', summary: 'Rodada gerada', detail: `A rodada ${roundToGenerate} foi criada.`, life: 2500 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Falha ao gerar rodada', detail: getErrorMessage(error, 'Nao foi possivel gerar a rodada.'), life: 4000 })
  } finally {
    roundLoading.value = false
  }
}

async function closeSelectedRound() {
  if (!canManageRounds.value) {
    toast.add({ severity: 'warn', summary: 'Rodada bloqueada', detail: 'So e possivel fechar rodadas em eventos em andamento.', life: 3000 })
    return
  }

  roundLoading.value = true
  try {
    const { data } = await closeRound(route.params.id, selectedRound.value)
    standings.value = data
    await refreshEntriesAndStandings()
    await loadRoundMatches()
    toast.add({ severity: 'success', summary: 'Rodada fechada', detail: 'Os standings foram atualizados.', life: 2500 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Falha ao fechar rodada', detail: getErrorMessage(error, 'Nao foi possivel fechar a rodada.'), life: 4000 })
  } finally {
    roundLoading.value = false
  }
}

async function finishCurrentEvent() {
  if (!event.value || !canFinishEvent.value) return

  const confirmed = window.confirm('Tem certeza que deseja finalizar este evento? Essa acao encerra o torneio.')
  if (!confirmed) return

  actionLoading.value = true
  try {
    const { data } = await finishEventRequest(route.params.id)
    event.value = data.event
    await refreshEntriesAndStandings()
    await loadRoundMatches()
    toast.add({ severity: 'success', summary: 'Evento finalizado', detail: data.message || 'O evento foi encerrado com sucesso.', life: 2500 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Falha ao finalizar evento', detail: getErrorMessage(error, 'Nao foi possivel finalizar o evento.'), life: 4000 })
  } finally {
    actionLoading.value = false
  }
}

async function startCurrentEvent() {
  if (!event.value || !canStartEvent.value) return

  const confirmed = window.confirm('Deseja iniciar este evento agora?')
  if (!confirmed) return

  actionLoading.value = true
  try {
    const { data } = await startEventRequest(route.params.id)
    event.value = data.event
    toast.add({ severity: 'success', summary: 'Evento iniciado', detail: data.message || 'O evento foi iniciado com sucesso.', life: 2500 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Falha ao iniciar evento', detail: getErrorMessage(error, 'Nao foi possivel iniciar o evento.'), life: 4000 })
  } finally {
    actionLoading.value = false
  }
}

async function cancelCurrentEvent() {
  if (!event.value || !canCancelEvent.value) return

  const confirmed = window.confirm('Deseja cancelar este evento?')
  if (!confirmed) return

  actionLoading.value = true
  try {
    const { data } = await cancelEventRequest(route.params.id)
    event.value = data.event
    await refreshEntriesAndStandings()
    await loadRoundMatches()
    toast.add({ severity: 'success', summary: 'Evento cancelado', detail: data.message || 'O evento foi cancelado.', life: 2500 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Falha ao cancelar evento', detail: getErrorMessage(error, 'Nao foi possivel cancelar o evento.'), life: 4000 })
  } finally {
    actionLoading.value = false
  }
}

onMounted(loadEventPage)
</script>
