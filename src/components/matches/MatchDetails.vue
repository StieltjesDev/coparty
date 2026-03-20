<template>
  <div class="page-shell page-shell--wide">
    <div class="w-full flex flex-column gap-4">
      <Card class="form-card">
        <template #title>
          <div class="flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <div class="flex gap-2 align-items-center flex-wrap">
                <h2 class="m-0">Match {{ match?._id }}</h2>
                <Tag v-if="event" :value="eventGameModeLabel" severity="warn" />
                <Tag v-if="match" :value="match.status" :severity="match.status === 'COMPLETED' ? 'success' : match.status === 'PENDING' ? 'info' : 'warn'" />
                <Tag v-if="canManage" :value="auth.state.user?.role === 'admin' ? 'Admin' : 'Organizador'" :severity="auth.state.user?.role === 'admin' ? 'danger' : 'success'" />
              </div>
              <small>Mesa {{ match?.tableNumber || '-' }} � Rodada {{ match?.round || '-' }}</small>
            </div>
            <div class="flex gap-2 flex-wrap">
              <Button label="Voltar ao evento" severity="secondary" @click="$router.push(`/events/${match?.eventId}`)" :disabled="!match" />
              <Button v-if="canManage && match?.status === 'COMPLETED'" label="Reabrir match" severity="warn" @click="reopenCurrentMatch" :loading="actionLoading" />
              <Button v-if="canManage && match?.status !== 'COMPLETED'" label="Marcar completa" severity="success" @click="completeCurrentMatch" :loading="actionLoading" />
            </div>
          </div>
        </template>
        <template #content>
          <div v-if="loading" class="text-center py-4">Carregando match...</div>
          <div v-else-if="match" class="flex flex-column gap-4">
            <div class="app-highlight-grid">
              <div class="app-highlight app-highlight--accent">
                <div>
                  <span class="app-highlight-label">Mesa e rodada</span>
                  <strong class="app-highlight-title">Mesa {{ match.tableNumber || '-' }} - Rodada {{ match.round || '-' }}</strong>
                </div>
                <p class="app-highlight-copy">Status atual: <strong>{{ match.status }}</strong>. Use esta area para revisar participantes e registrar o resultado oficial.</p>
              </div>
              <div class="app-highlight">
                <div>
                  <span class="app-highlight-label">Formato da match</span>
                  <strong class="app-highlight-title">{{ eventGameModeLabel }}</strong>
                </div>
                <p class="app-highlight-copy">{{ canManage ? 'Voce pode enviar, concluir ou reabrir resultados nesta mesa.' : 'Voce esta em modo consulta e nao pode alterar o resultado.' }}</p>
              </div>
            </div>

            <div class="table-surface">
              <DataTable :value="participantRows" dataKey="eventEntryId" stripedRows>
              <Column field="seatOrder" header="Seat" />
              <Column field="displayName" header="Player" />
              <Column field="deckName" header="Deck" />
              <Column field="resultType" header="Resultado" />
              <Column field="placement" header="Placement" />
              <Column field="pointsEarned" header="Pontos" />
              </DataTable>
            </div>

            <Divider />

            <Message v-if="match.status === 'COMPLETED'" severity="success" :closable="false">
              Esta match ja foi concluida. Reabra a match para reenviar o resultado.
            </Message>

            <div v-if="!canManage">
              <Message severity="info" :closable="false">Apenas organizador do evento ou admin pode lancar resultado.</Message>
            </div>

            <div v-else-if="isCommander" class="flex flex-column gap-3">
              <h3 class="m-0">Resultado Commander</h3>
              <Message severity="secondary" :closable="false">Informe placement unico para cada player. Placement 1 define o vencedor.</Message>
              <div v-for="participant in resultForm" :key="participant.eventEntryId" class="grid align-items-end">
                <div class="col-12 md:col-3"><strong>{{ participant.label }}</strong></div>
                <div class="col-12 md:col-3">
                  <FloatLabel variant="on">
                    <InputNumber :inputId="`placement-${participant.eventEntryId}`" v-model="participant.placement" :min="1" fluid />
                    <label :for="`placement-${participant.eventEntryId}`">Placement</label>
                  </FloatLabel>
                </div>
                <div class="col-12 md:col-3">
                  <FloatLabel variant="on">
                    <InputNumber :inputId="`points-${participant.eventEntryId}`" v-model="participant.pointsEarned" :min="0" fluid />
                    <label :for="`points-${participant.eventEntryId}`">Pontos</label>
                  </FloatLabel>
                </div>
                <div class="col-12 md:col-3">
                  <FloatLabel variant="on">
                    <InputNumber :inputId="`elims-${participant.eventEntryId}`" v-model="participant.eliminations" :min="0" fluid />
                    <label :for="`elims-${participant.eventEntryId}`">Eliminations</label>
                  </FloatLabel>
                </div>
              </div>
              <div class="flex justify-content-end">
                <Button label="Enviar resultado" icon="pi pi-send" :loading="actionLoading" @click="submitCommanderResult" :disabled="match.status === 'COMPLETED'" />
              </div>
            </div>

            <div v-else class="flex flex-column gap-3">
              <h3 class="m-0">Resultado 1v1</h3>
              <Message severity="secondary" :closable="false">Selecione o vencedor ou marque empate. Depois finalize a match.</Message>
              <FloatLabel variant="on">
                <Select id="winner" v-model="selectedWinner" :options="winnerOptions" optionLabel="label" optionValue="value" fluid :disabled="isDraw || match.status === 'COMPLETED'" />
                <label for="winner">Vencedor</label>
              </FloatLabel>
              <div class="flex align-items-center gap-2">
                <Checkbox inputId="draw" v-model="isDraw" binary :disabled="match.status === 'COMPLETED'" />
                <label for="draw">Empate</label>
              </div>
              <div class="flex justify-content-end">
                <Button label="Enviar resultado" icon="pi pi-send" :loading="actionLoading" @click="submitOneVsOneResult" :disabled="match.status === 'COMPLETED'" />
              </div>
            </div>
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
import Checkbox from 'primevue/checkbox'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Divider from 'primevue/divider'
import FloatLabel from 'primevue/floatlabel'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { EVENT_GAME_MODE_LABELS } from '@/constants/options'
import { getErrorMessage } from '@/services/error'
import { getEvent } from '@/services/events'
import { getMatch, reopenMatch, submitMatchResult, updateMatchStatus } from '@/services/matches'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const toast = useToast()
const auth = useAuthStore()

const loading = ref(false)
const actionLoading = ref(false)
const match = ref(null)
const event = ref(null)
const isDraw = ref(false)
const selectedWinner = ref(null)
const resultForm = ref([])

const canManage = computed(() => {
  if (!event.value || !auth.state.user) return false
  return auth.state.user.role === 'admin' || auth.state.user.id === event.value.createdByUserId
})

const eventGameModeLabel = computed(() => EVENT_GAME_MODE_LABELS[event.value?.gameMode] || event.value?.gameMode || '-')
const isCommander = computed(() => event.value?.gameMode === 'COMMANDER_MULTIPLAYER')

const participantRows = computed(() => (match.value?.participants || []).map((participant) => ({
  eventEntryId: participant.eventEntryId?._id || participant.eventEntryId,
  seatOrder: participant.seatOrder,
  displayName: participant.eventEntryId?.playerId?.displayName || 'Participante',
  deckName: participant.eventEntryId?.deckId?.name || '-',
  resultType: participant.resultType || '-',
  placement: participant.placement || '-',
  pointsEarned: participant.pointsEarned || 0,
})))

const winnerOptions = computed(() => participantRows.value.map((row) => ({
  label: row.displayName,
  value: row.eventEntryId,
})))

function buildCommanderDefaults() {
  resultForm.value = participantRows.value.map((row, index) => ({
    eventEntryId: row.eventEntryId,
    label: row.displayName,
    placement: index + 1,
    pointsEarned: [5, 3, 2, 1][index] || 0,
    eliminations: 0,
  }))
}

async function loadMatchPage() {
  loading.value = true
  try {
    await auth.fetchSession().catch(() => null)
    const { data } = await getMatch(route.params.id)
    match.value = data
    const eventResponse = await getEvent(data.eventId)
    event.value = eventResponse.data
    selectedWinner.value = participantRows.value[0]?.eventEntryId || null
    buildCommanderDefaults()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: getErrorMessage(error, 'Nao foi possivel carregar a match.'), life: 4000 })
  } finally {
    loading.value = false
  }
}

async function refreshMatch() {
  const { data } = await getMatch(route.params.id)
  match.value = data
  buildCommanderDefaults()
}

async function submitOneVsOneResult() {
  if (!isDraw.value && !selectedWinner.value) {
    toast.add({ severity: 'warn', summary: 'Escolha o resultado', detail: 'Informe o vencedor ou marque empate.', life: 3000 })
    return
  }

  actionLoading.value = true
  try {
    const participants = participantRows.value.map((row) => {
      if (isDraw.value) {
        return {
          eventEntryId: row.eventEntryId,
          resultType: 'DRAW',
          placement: 1,
          score: 1,
          pointsEarned: 1,
          isWinner: false,
          eliminations: 0,
        }
      }

      const isWinner = row.eventEntryId === selectedWinner.value
      return {
        eventEntryId: row.eventEntryId,
        resultType: isWinner ? 'WIN' : 'LOSS',
        placement: isWinner ? 1 : 2,
        score: isWinner ? 2 : 0,
        pointsEarned: isWinner ? 3 : 0,
        isWinner,
        eliminations: 0,
      }
    })

    await submitMatchResult(route.params.id, participants)
    await refreshMatch()
    toast.add({ severity: 'success', summary: 'Resultado enviado', detail: 'A match foi atualizada.', life: 2500 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Falha ao enviar', detail: getErrorMessage(error, 'Nao foi possivel enviar o resultado.'), life: 4000 })
  } finally {
    actionLoading.value = false
  }
}

async function submitCommanderResult() {
  actionLoading.value = true
  try {
    const participants = resultForm.value.map((participant) => ({
      eventEntryId: participant.eventEntryId,
      resultType: participant.placement === 1 ? 'WIN' : 'LOSS',
      placement: participant.placement,
      score: Math.max(0, 5 - participant.placement),
      pointsEarned: participant.pointsEarned ?? 0,
      isWinner: participant.placement === 1,
      eliminations: participant.eliminations ?? 0,
    }))

    await submitMatchResult(route.params.id, participants)
    await refreshMatch()
    toast.add({ severity: 'success', summary: 'Resultado enviado', detail: 'A mesa Commander foi atualizada.', life: 2500 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Falha ao enviar', detail: getErrorMessage(error, 'Nao foi possivel enviar o resultado.'), life: 4000 })
  } finally {
    actionLoading.value = false
  }
}

async function completeCurrentMatch() {
  actionLoading.value = true
  try {
    await updateMatchStatus(route.params.id, 'COMPLETED')
    await refreshMatch()
    toast.add({ severity: 'success', summary: 'Match concluida', detail: 'O rating e os standings ja podem considerar este resultado.', life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Falha ao concluir', detail: getErrorMessage(error, 'Nao foi possivel concluir a match.'), life: 4000 })
  } finally {
    actionLoading.value = false
  }
}

async function reopenCurrentMatch() {
  actionLoading.value = true
  try {
    await reopenMatch(route.params.id)
    await refreshMatch()
    toast.add({ severity: 'success', summary: 'Match reaberta', detail: 'O resultado foi limpo para reprocessamento.', life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Falha ao reabrir', detail: getErrorMessage(error, 'Nao foi possivel reabrir a match.'), life: 4000 })
  } finally {
    actionLoading.value = false
  }
}

onMounted(loadMatchPage)
</script>
