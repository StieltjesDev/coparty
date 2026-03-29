<template>
  <div class="page-shell page-shell--wide">
    <div class="event-form-layout">
      <Card class="page-card form-card event-form-main">
        <template #title>{{ isEditMode ? 'Editar evento' : 'Novo evento' }}</template>
        <template #content>
          <div class="app-highlight app-highlight--accent mb-4">
            <div>
              <span class="app-highlight-label">Planejamento</span>
              <strong class="app-highlight-title">{{ isEditMode ? 'Revise os dados do evento' : 'Monte o evento em poucos passos' }}</strong>
            </div>
            <p class="app-highlight-copy">Voce escolhe o formato e o sistema resolve as combinacoes validas de modo e pareamento para evitar cadastro confuso.</p>
          </div>

          <Message v-if="isLockedEvent" severity="warn" :closable="false" class="mb-4">
            Eventos em andamento, completos ou cancelados nao podem mais ser alterados.
          </Message>

          <form class="event-form-stack" @submit.prevent="saveEvent">
            <section class="event-form-section">
              <div class="event-form-section__header">
                <span class="event-form-section__index">1</span>
                <div>
                  <h3 class="event-form-section__title">Identificacao</h3>
                  <p class="event-form-section__copy">Defina nome e descricao para o evento aparecer com clareza para os jogadores.</p>
                </div>
              </div>

              <div class="event-form-fields">
                <FloatLabel variant="on">
                  <InputText id="name" v-model="form.name" fluid :disabled="isLockedEvent" />
                  <label for="name">Nome</label>
                </FloatLabel>

                <FloatLabel variant="on">
                  <Textarea id="description" v-model="form.description" rows="4" autoResize fluid :disabled="isLockedEvent" />
                  <label for="description">Descricao</label>
                </FloatLabel>
              </div>
            </section>

            <section class="event-form-section">
              <div class="event-form-section__header">
                <span class="event-form-section__index">2</span>
                <div>
                  <h3 class="event-form-section__title">Estrutura do torneio</h3>
                  <p class="event-form-section__copy">Formato, modo e pareamento ficam alinhados automaticamente conforme a regra do sistema.</p>
                </div>
              </div>

              <div class="event-form-fields">
                <div class="grid">
                  <div class="col-12 md:col-4">
                    <FloatLabel variant="on">
                      <Select id="format" v-model="form.format" :options="DECK_FORMAT_OPTIONS" optionLabel="label" optionValue="value" fluid :disabled="isLockedEvent" />
                      <label for="format">Formato</label>
                    </FloatLabel>
                  </div>
                  <div class="col-12 md:col-4" v-if="showGameModeSelect">
                    <FloatLabel variant="on">
                      <Select id="gameMode" v-model="form.gameMode" :options="EVENT_GAME_MODE_OPTIONS" optionLabel="label" optionValue="value" fluid :disabled="isLockedEvent" />
                      <label for="gameMode">Modo de jogo</label>
                    </FloatLabel>
                  </div>
                  <div class="col-12 md:col-4" v-if="showPairingSelect">
                    <FloatLabel variant="on">
                      <Select id="pairingType" v-model="form.pairingType" :options="availablePairingOptions" optionLabel="label" optionValue="value" fluid :disabled="isLockedEvent" />
                      <label for="pairingType">Pareamento</label>
                    </FloatLabel>
                  </div>
                </div>

                <div class="event-summary-grid">
                  <article class="event-summary-card">
                    <span class="event-summary-card__label">Formato</span>
                    <strong class="event-summary-card__value">{{ selectedFormatLabel }}</strong>
                    <p class="event-summary-card__copy">Base oficial usada para validar decks na inscricao.</p>
                  </article>
                  <article class="event-summary-card">
                    <span class="event-summary-card__label">Modo resolvido</span>
                    <strong class="event-summary-card__value">{{ resolvedGameModeLabel }}</strong>
                    <p class="event-summary-card__copy">{{ gameModeFieldCopy }}</p>
                  </article>
                  <article class="event-summary-card">
                    <span class="event-summary-card__label">Pareamento final</span>
                    <strong class="event-summary-card__value">{{ resolvedPairingLabel }}</strong>
                    <p class="event-summary-card__copy">{{ pairingFieldCopy }}</p>
                  </article>
                </div>

                <Message v-if="!isLockedEvent" severity="secondary" :closable="false">
                  {{ gameModeHelperText }}
                </Message>
              </div>
            </section>

            <section class="event-form-section">
              <div class="event-form-section__header">
                <span class="event-form-section__index">3</span>
                <div>
                  <h3 class="event-form-section__title">Agenda e capacidade</h3>
                  <p class="event-form-section__copy">Defina quando o evento acontece e quantos jogadores ele aceita.</p>
                </div>
              </div>

              <div class="event-form-fields">
                <div class="grid">
                  <div class="col-12 md:col-4">
                    <FloatLabel variant="on">
                      <InputNumber id="maxPlayers" v-model="form.maxPlayers" fluid :min="2" :disabled="isLockedEvent" />
                      <label for="maxPlayers">Maximo de players</label>
                    </FloatLabel>
                  </div>
                  <div class="col-12 md:col-8">
                    <FloatLabel variant="on">
                      <DatePicker id="dateTime" v-model="form.dateTime" fluid showTime hourFormat="24" :disabled="isLockedEvent" />
                      <label for="dateTime">Data e hora</label>
                    </FloatLabel>
                  </div>
                </div>
              </div>
            </section>

            <div class="flex justify-content-end gap-2 flex-wrap">
              <Button type="button" label="Voltar" severity="secondary" @click="$router.push('/events')" />
              <Button v-if="isEditMode && !isLockedEvent" type="button" label="Excluir" severity="danger" @click="removeEvent" />
              <Button type="button" :label="isEditMode ? 'Salvar' : 'Criar evento'" :loading="loading" :disabled="isLockedEvent" @click="saveEvent" />
            </div>
          </form>
        </template>
      </Card>

      <aside class="event-form-side">
        <div class="app-highlight">
          <div>
            <span class="app-highlight-label">Resumo rapido</span>
            <strong class="app-highlight-title">{{ selectedFormatLabel }}</strong>
          </div>
          <p class="app-highlight-copy">{{ sideSummaryText }}</p>
        </div>

        <div class="event-rule-list">
          <div class="event-rule-list__item">
            <span class="event-rule-list__bullet"></span>
            <span>{{ resolvedGameModeLabel }} e {{ resolvedPairingLabel }} serao usados ao salvar.</span>
          </div>
          <div class="event-rule-list__item">
            <span class="event-rule-list__bullet"></span>
            <span>Commander multiplayer sempre fica em mesas de 3 a 4 jogadores com pareamento Suico.</span>
          </div>
          <div class="event-rule-list__item">
            <span class="event-rule-list__bullet"></span>
            <span>Eventos Custom mantem liberdade, mas so mostram as opcoes compativeis com o modo escolhido.</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import DatePicker from 'primevue/datepicker'
import FloatLabel from 'primevue/floatlabel'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import {
  DECK_FORMAT_LABELS,
  DECK_FORMAT_OPTIONS,
  DEFAULT_PAIRING_BY_GAME_MODE,
  EVENT_GAME_MODE_LABELS,
  EVENT_GAME_MODE_OPTIONS,
  EVENT_PAIRING_LABELS,
  EVENT_PAIRING_OPTIONS,
  EVENT_PAIRING_OPTIONS_BY_GAME_MODE,
} from '@/constants/options'
import { createEvent, deleteEventById, getEvent, updateEvent } from '@/services/events'
import { getErrorMessage } from '@/services/error'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()
const loading = ref(false)
const form = reactive({
  name: '',
  description: '',
  dateTime: null,
  format: 'MODERN',
  pairingType: 'SWISS',
  gameMode: 'ONE_VS_ONE',
  maxPlayers: null,
})
const eventStatus = ref('SCHEDULED')

const COMMANDER_MULTIPLAYER_FORMATS = ['COMMANDER', 'COMMANDER_500', 'COMMANDER_250', 'COMMANDER_15']

const isEditMode = computed(() => Boolean(route.params.id))
const isLockedEvent = computed(() => isEditMode.value && ['ONGOING', 'FINISHED', 'COMPLETED', 'CANCELLED'].includes(eventStatus.value))
const resolvedGameMode = computed(() => resolveGameModeForFormat(form.format, form.gameMode))
const availablePairingOptions = computed(() => {
  const allowedPairings = EVENT_PAIRING_OPTIONS_BY_GAME_MODE[resolvedGameMode.value] || EVENT_PAIRING_OPTIONS_BY_GAME_MODE.ONE_VS_ONE
  return EVENT_PAIRING_OPTIONS.filter((option) => allowedPairings.includes(option.value))
})
const isPairingLocked = computed(() => availablePairingOptions.value.length <= 1)
const showGameModeSelect = computed(() => form.format === 'CUSTOM')
const showPairingSelect = computed(() => form.format === 'CUSTOM' && !isPairingLocked.value)
const selectedFormatLabel = computed(() => DECK_FORMAT_LABELS[form.format] || form.format || 'Custom')
const resolvedGameModeLabel = computed(() => EVENT_GAME_MODE_LABELS[resolvedGameMode.value] || resolvedGameMode.value || '-')
const resolvedPairingType = computed(() => resolvePairingTypeForGameMode(resolvedGameMode.value, form.pairingType))
const resolvedPairingLabel = computed(() => EVENT_PAIRING_LABELS[resolvedPairingType.value] || resolvedPairingType.value || '-')
const gameModeFieldCopy = computed(() => {
  if (showGameModeSelect.value) {
    return 'Voce ainda pode escolher o modo porque o formato esta em Custom.'
  }

  return 'Esse modo foi definido automaticamente pelo formato selecionado.'
})
const pairingFieldCopy = computed(() => {
  if (showPairingSelect.value) {
    return 'O usuario escolhe apenas entre os pareamentos validos para esse modo.'
  }

  return 'O sistema travou esse pareamento para evitar combinacoes invalidas.'
})
const gameModeHelperText = computed(() => {
  if (form.format === 'CUSTOM') {
    if (isPairingLocked.value) {
      return 'No modo selecionado, o sistema trava automaticamente o pareamento em Suico para manter a estrutura do evento consistente.'
    }

    return 'Formato Custom permite escolher livremente o modo de jogo. O pareamento disponivel muda conforme o modo selecionado.'
  }

  if (COMMANDER_MULTIPLAYER_FORMATS.includes(form.format)) {
    return `Formato ${DECK_FORMAT_LABELS[form.format]} sempre usa commander multiplayer com pareamento Suico e separacao automatica de mesas entre 3 e 4 jogadores.`
  }

  if (form.format === 'COMMANDER_DUEL') {
    return 'Commander Duel sempre usa duelo 1x1. O sistema libera apenas os pareamentos validos para esse modelo.'
  }

  return `Formato ${DECK_FORMAT_LABELS[form.format] || form.format} sempre usa duelo 1x1.`
})
const sideSummaryText = computed(() => {
  if (COMMANDER_MULTIPLAYER_FORMATS.includes(form.format)) {
    return 'Ideal para eventos multiplayer de Commander com mesas automaticas e pareamento fixo em Suico.'
  }

  if (form.format === 'CUSTOM') {
    return 'Use Custom apenas quando voce realmente precisa controlar o modo manualmente.'
  }

  return 'Fluxo simplificado para torneios competitivos de duelo, com combinacoes validas de modo e pareamento.'
})

watch(
  () => form.format,
  (format) => {
    form.gameMode = resolveGameModeForFormat(format, form.gameMode)
  },
  { immediate: true },
)

watch(
  resolvedGameMode,
  (gameMode) => {
    form.pairingType = resolvePairingTypeForGameMode(gameMode, form.pairingType)
  },
  { immediate: true },
)

onMounted(async () => {
  if (!isEditMode.value) {
    form.dateTime = new Date(Date.now() + 3600_000)
    return
  }

  loading.value = true
  try {
    const { data } = await getEvent(route.params.id)
    eventStatus.value = data.status || 'SCHEDULED'
    form.name = data.name || ''
    form.description = data.description || ''
    form.dateTime = data.dateTime ? new Date(data.dateTime) : null
    form.format = data.format || 'CUSTOM'
    form.gameMode = resolveGameModeForFormat(data.format || 'CUSTOM', data.gameMode || 'ONE_VS_ONE')
    form.pairingType = resolvePairingTypeForGameMode(form.gameMode, data.pairingType || 'SWISS')
    form.maxPlayers = data.maxPlayers || null
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: getErrorMessage(error, 'Nao foi possivel carregar o evento.'), life: 4000 })
  } finally {
    loading.value = false
  }
})

function resolveGameModeForFormat(format, currentGameMode = 'ONE_VS_ONE') {
  if (format === 'CUSTOM') {
    return currentGameMode
  }

  return COMMANDER_MULTIPLAYER_FORMATS.includes(format) ? 'COMMANDER_MULTIPLAYER' : 'ONE_VS_ONE'
}

function resolvePairingTypeForGameMode(gameMode, currentPairingType = 'SWISS') {
  const allowedPairings = EVENT_PAIRING_OPTIONS_BY_GAME_MODE[gameMode] || EVENT_PAIRING_OPTIONS_BY_GAME_MODE.ONE_VS_ONE
  return allowedPairings.includes(currentPairingType) ? currentPairingType : (DEFAULT_PAIRING_BY_GAME_MODE[gameMode] || 'SWISS')
}

async function saveEvent() {
  if (isLockedEvent.value) {
    toast.add({ severity: 'warn', summary: 'Edicao bloqueada', detail: 'Eventos em andamento, completos ou cancelados nao podem ser alterados.', life: 3500 })
    return
  }

  loading.value = true
  try {
    if (!form.format) {
      throw new Error('Selecione o formato do evento.')
    }

    if (!form.dateTime) {
      throw new Error('Selecione a data e hora do evento.')
    }

    if (form.dateTime < new Date()) {
      throw new Error('Evento agendado precisa ter data futura.')
    }

    const normalizedGameMode = resolveGameModeForFormat(form.format, form.gameMode)
    const normalizedPairingType = resolvePairingTypeForGameMode(normalizedGameMode, form.pairingType)

    const payload = {
      name: form.name,
      description: form.description,
      dateTime: form.dateTime?.toISOString(),
      format: form.format,
      pairingType: normalizedPairingType,
      gameMode: normalizedGameMode,
      maxPlayers: form.maxPlayers || undefined,
    }

    if (isEditMode.value) {
      await updateEvent(route.params.id, payload)
      toast.add({ severity: 'success', summary: 'Evento atualizado', detail: 'As alteracoes foram salvas.', life: 2500 })
    } else {
      await createEvent(payload)
      toast.add({ severity: 'success', summary: 'Evento criado', detail: 'O evento foi agendado.', life: 2500 })
    }

    await router.push('/events')
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro ao salvar', detail: getErrorMessage(error, 'Nao foi possivel salvar o evento.'), life: 4000 })
  } finally {
    loading.value = false
  }
}

function removeEvent() {
  if (isLockedEvent.value) {
    toast.add({ severity: 'warn', summary: 'Exclusao bloqueada', detail: 'Este evento nao pode mais ser alterado ou removido.', life: 3500 })
    return
  }

  confirm.require({
    message: 'Deseja excluir este evento?',
    header: 'Excluir evento',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Excluir',
    rejectLabel: 'Cancelar',
    accept: async () => {
      try {
        await deleteEventById(route.params.id)
        toast.add({ severity: 'success', summary: 'Evento excluido', detail: 'O evento foi removido.', life: 2500 })
        await router.push('/events')
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro ao excluir', detail: getErrorMessage(error, 'Nao foi possivel excluir o evento.'), life: 4000 })
      }
    },
  })
}
</script>

<style scoped>
.event-form-layout {
  width: min(100%, 72rem);
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(18rem, 0.9fr);
  gap: 1.25rem;
}

.event-form-main {
  width: 100%;
}

.event-form-side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-form-stack {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.event-form-section {
  padding: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 24px;
  background: rgba(7, 14, 26, 0.32);
}

.event-form-section__header {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.event-form-section__index {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(56, 189, 248, 0.14);
  color: #bfdbfe;
  font-weight: 700;
  flex: 0 0 auto;
}

.event-form-section__title {
  margin: 0;
  color: #f8fafc;
  font-size: 1rem;
}

.event-form-section__copy {
  margin: 0.3rem 0 0;
  color: var(--app-text-soft);
  line-height: 1.5;
}

.event-form-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.9rem;
}

.event-summary-card {
  border-radius: 20px;
  border: 1px solid rgba(56, 189, 248, 0.18);
  background: rgba(9, 16, 30, 0.76);
  padding: 0.95rem 1rem;
}

.event-summary-card__label {
  display: block;
  margin-bottom: 0.5rem;
  color: #93c5fd;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.72rem;
}

.event-summary-card__value {
  display: block;
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 700;
}

.event-summary-card__copy {
  margin: 0.5rem 0 0;
  color: var(--app-text-soft);
  line-height: 1.5;
}

.event-rule-list {
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(9, 16, 30, 0.7);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.event-rule-list__item {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
  color: var(--app-text-soft);
  line-height: 1.5;
}

.event-rule-list__bullet {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 999px;
  margin-top: 0.45rem;
  background: linear-gradient(135deg, var(--app-accent) 0%, var(--app-accent-strong) 100%);
  flex: 0 0 auto;
}

@media (max-width: 1024px) {
  .event-form-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .event-form-section {
    padding: 0.9rem;
  }

  .event-summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>

