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
                <Tag v-if="event" :value="event.status" :severity="event.status === 'SCHEDULED' ? 'info' : event.status === 'ONGOING' ? 'success' : 'contrast'" />
              </div>
              <small>{{ event?.gameMode }} • {{ event?.pairingType }}</small>
            </div>
            <div class="flex gap-2 flex-wrap" v-if="event">
              <Button label="Voltar" severity="secondary" @click="$router.push('/events')" />
              <Button v-if="canManageEvent" label="Editar evento" icon="pi pi-pencil" @click="$router.push(`/events/${event._id}/edit`)" />
              <Button
                v-if="canStartEvent"
                label="Iniciar evento"
                icon="pi pi-play"
                severity="success"
                :loading="actionLoading"
                @click="startCurrentEvent"
              />
              <Button
                v-if="canCancelEvent"
                label="Cancelar evento"
                icon="pi pi-times"
                severity="warning"
                :loading="actionLoading"
                @click="cancelCurrentEvent"
              />
              <Button
                v-if="canFinishEvent"
                label="Finalizar evento"
                icon="pi pi-flag"
                severity="danger"
                :loading="actionLoading"
                @click="finishCurrentEvent"
              />
            </div>
          </div>
        </template>
        <template #content>
          <div v-if="loadingEvent" class="text-center py-4">Carregando evento...</div>
          <div v-else-if="event" class="grid">
            <div class="col-12 md:col-6"><strong>Data:</strong> {{ formatDateTime(event.dateTime) }}</div>
            <div class="col-12 md:col-6"><strong>Max players:</strong> {{ event.maxPlayers || 'Livre' }}</div>
            <div class="col-12"><strong>Descricao:</strong> {{ event.description || 'Sem descricao' }}</div>
          </div>
        </template>
      </Card>

      <Card class="form-card" v-if="event">
        <template #title>Inscricao no evento</template>
        <template #content>
          <Message v-if="!auth.state.user" severity="warn" :closable="false">Faca login para entrar no evento.</Message>
          <Message v-else-if="!playerStore.state.player" severity="warn" :closable="false">
            Crie seu player antes de entrar em eventos.
          </Message>
          <Message v-else-if="!myDecks.length && !myEntry" severity="warn" :closable="false">
            Voce precisa cadastrar pelo menos um deck antes de entrar no evento.
          </Message>
          <div v-else-if="myEntry" class="flex flex-column gap-2">
            <Message severity="success" :closable="false">
              Voce ja esta inscrito neste evento com o deck {{ myEntry.deckId?.name || myEntry.deckId }}.
            </Message>
            <div class="flex justify-content-end">
              <Button label="Cancelar inscricao" severity="danger" :loading="joining" @click="leaveCurrentEvent" />
            </div>
          </div>
          <div v-else class="flex flex-column gap-3">
            <FloatLabel variant="on">
              <Select id="deckId" v-model="selectedDeckId" :options="deckOptions" optionLabel="label" optionValue="value" fluid />
              <label for="deckId">Escolha o deck</label>
            </FloatLabel>
            <div class="flex justify-content-end">
              <Button label="Entrar no evento" icon="pi pi-user-plus" :loading="joining" @click="joinCurrentEvent" :disabled="!deckOptions.length" />
            </div>
          </div>
        </template>
      </Card>

      <Card class="form-card" v-if="event">
        <template #title>Inscricoes</template>
        <template #content>
          <Message v-if="!entries.length" severity="info" :closable="false">Nenhum inscrito ainda.</Message>
          <DataTable v-else :value="entries" dataKey="_id" stripedRows>
            <Column field="playerId.displayName" header="Player" />
            <Column field="deckId.name" header="Deck" />
            <Column field="deckId.format" header="Formato" />
            <Column field="status" header="Status" />
          </DataTable>
        </template>
      </Card>

      <Card class="form-card" v-if="event">
        <template #title>
          <div class="flex justify-content-between align-items-center flex-wrap gap-3">
            <span>Rodadas e matches</span>
            <div class="flex gap-2 align-items-center flex-wrap">
              <FloatLabel variant="on">
                <InputNumber id="round" v-model="selectedRound" :min="1" inputStyle="width: 6rem" />
                <label for="round">Rodada</label>
              </FloatLabel>
              <Button label="Carregar" severity="secondary" @click="loadRoundMatches" />
              <Button v-if="canManageEvent" label="Gerar rodada" icon="pi pi-sync" :loading="roundLoading" @click="generateSelectedRound" />
              <Button v-if="canManageEvent" label="Fechar rodada" icon="pi pi-check" severity="success" :loading="roundLoading" @click="closeSelectedRound" :disabled="!roundMatches.length" />
            </div>
          </div>
        </template>
        <template #content>
          <Message v-if="!canManageEvent" severity="secondary" :closable="false">
            Visualizacao liberada. Geracao e fechamento de rodada sao exclusivos do organizador ou admin.
          </Message>
          <Message v-if="!roundMatches.length" severity="info" :closable="false">Nenhuma match carregada para essa rodada.</Message>
          <DataTable v-else :value="roundMatches" dataKey="_id" stripedRows>
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
        </template>
      </Card>

      <Card class="form-card" v-if="event">
        <template #title>Standings</template>
        <template #content>
          <Message v-if="!standings.length" severity="info" :closable="false">Ainda nao ha standings para este evento.</Message>
          <DataTable v-else :value="standings" dataKey="eventEntryId" stripedRows>
            <Column field="position" header="#" />
            <Column field="player.displayName" header="Player" />
            <Column field="deck.name" header="Deck" />
            <Column field="points" header="Pontos" />
            <Column field="wins" header="Wins" />
            <Column field="losses" header="Losses" />
            <Column field="draws" header="Draws" />
            <Column field="byes" header="Byes" />
          </DataTable>
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
import { listMyDecks } from '@/services/decks'
import { getErrorMessage } from '@/services/error'
import {
  cancelEvent as cancelEventRequest,
  closeRound,
  finishEvent as finishEventRequest,
  generateRound,
  getEvent,
  getEventEntries,
  getRound,
  getStandings,
  joinEvent,
  leaveEvent,
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
const event = ref(null)
const entries = ref([])
const standings = ref([])
const roundMatches = ref([])
const myDecks = ref([])
const selectedDeckId = ref(null)
const selectedRound = ref(1)

const canManageEvent = computed(() => {
  if (!event.value || !auth.state.user) return false
  return auth.state.user.role === 'admin' || auth.state.user.id === event.value.createdByUserId
})

const deckOptions = computed(() => myDecks.value.map((deck) => ({
  label: `${deck.name} (${deck.format})`,
  value: deck._id,
})))

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

function formatParticipants(participants = []) {
  return participants
    .map((participant) => participant.eventEntryId?.playerId?.displayName || 'Participante')
    .join(' x ')
}

async function loadEventPage() {
  loadingEvent.value = true
  try {
    await auth.fetchSession().catch(() => null)
    if (auth.state.user) {
      await playerStore.fetchMyPlayer().catch(() => null)
      const decksResponse = await listMyDecks().catch(() => ({ data: [] }))
      myDecks.value = decksResponse.data || []
      selectedDeckId.value = myDecks.value[0]?._id || null
    }

    const [eventResponse, entriesResponse, standingsResponse] = await Promise.all([
      getEvent(route.params.id),
      getEventEntries(route.params.id),
      getStandings(route.params.id).catch(() => ({ data: [] })),
    ])

    event.value = eventResponse.data
    entries.value = entriesResponse.data
    standings.value = standingsResponse.data || []
    await loadRoundMatches()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: getErrorMessage(error, 'Nao foi possivel carregar o evento.'), life: 4000 })
  } finally {
    loadingEvent.value = false
  }
}

async function refreshEntriesAndStandings() {
  const [entriesResponse, standingsResponse] = await Promise.all([
    getEventEntries(route.params.id),
    getStandings(route.params.id).catch(() => ({ data: [] })),
  ])
  entries.value = entriesResponse.data
  standings.value = standingsResponse.data || []
}

async function joinCurrentEvent() {
  if (!selectedDeckId.value) {
    toast.add({ severity: 'warn', summary: 'Deck obrigatorio', detail: 'Selecione um deck para entrar no evento.', life: 3000 })
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

async function loadRoundMatches() {
  try {
    const { data } = await getRound(route.params.id, selectedRound.value)
    roundMatches.value = data
  } catch (error) {
    roundMatches.value = []
  }
}

async function generateSelectedRound() {
  roundLoading.value = true
  try {
    const { data } = await generateRound(route.params.id, selectedRound.value)
    roundMatches.value = data
    await refreshEntriesAndStandings()
    toast.add({ severity: 'success', summary: 'Rodada gerada', detail: 'As mesas foram criadas.', life: 2500 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Falha ao gerar rodada', detail: getErrorMessage(error, 'Nao foi possivel gerar a rodada.'), life: 4000 })
  } finally {
    roundLoading.value = false
  }
}

async function closeSelectedRound() {
  roundLoading.value = true
  try {
    const { data } = await closeRound(route.params.id, selectedRound.value)
    standings.value = data
    await loadRoundMatches()
    toast.add({ severity: 'success', summary: 'Rodada fechada', detail: 'Os standings foram atualizados.', life: 2500 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Falha ao fechar rodada', detail: getErrorMessage(error, 'Nao foi possivel fechar a rodada.'), life: 4000 })
  } finally {
    roundLoading.value = false
  }
}

async function finishCurrentEvent() {
  if (!event.value || !canFinishEvent.value) {
    return
  }

  const confirmed = window.confirm('Tem certeza que deseja finalizar este evento? Essa acao encerra o torneio.')
  if (!confirmed) {
    return
  }

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
  if (!event.value || !canStartEvent.value) {
    return
  }

  const confirmed = window.confirm('Deseja iniciar este evento agora?')
  if (!confirmed) {
    return
  }

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
  if (!event.value || !canCancelEvent.value) {
    return
  }

  const confirmed = window.confirm('Deseja cancelar este evento?')
  if (!confirmed) {
    return
  }

  actionLoading.value = true
  try {
    const { data } = await cancelEventRequest(route.params.id)
    event.value = data.event
    toast.add({ severity: 'success', summary: 'Evento cancelado', detail: data.message || 'O evento foi cancelado.', life: 2500 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Falha ao cancelar evento', detail: getErrorMessage(error, 'Nao foi possivel cancelar o evento.'), life: 4000 })
  } finally {
    actionLoading.value = false
  }
}

onMounted(loadEventPage)
</script>

