<template>
  <div class="page-shell">
    <Card class="page-card form-card">
      <template #title>{{ isEditMode ? 'Editar evento' : 'Novo evento' }}</template>
      <template #content>
        <div class="app-highlight app-highlight--accent mb-4">
          <div>
            <span class="app-highlight-label">Planejamento</span>
            <strong class="app-highlight-title">{{ isEditMode ? 'Revise os dados do evento' : 'Configure o evento antes de abrir inscricoes' }}</strong>
          </div>
          <p class="app-highlight-copy">Defina formato, modo, pareamento, limite de jogadores e horario para manter o torneio consistente desde a criacao.</p>
        </div>

        <Message v-if="isLockedEvent" severity="warn" :closable="false" class="mb-4">
          Eventos em andamento, completos ou cancelados nao podem mais ser alterados.
        </Message>

        <form class="flex flex-column gap-3" @submit.prevent="saveEvent">
          <div>
            <FloatLabel variant="on">
              <InputText id="name" v-model="form.name" fluid :disabled="isLockedEvent" />
              <label for="name">Nome</label>
            </FloatLabel>
          </div>

          <div>
            <FloatLabel variant="on">
              <Textarea id="description" v-model="form.description" rows="4" autoResize fluid :disabled="isLockedEvent" />
              <label for="description">Descricao</label>
            </FloatLabel>
          </div>

          <div class="grid">
            <div class="col-12 md:col-4">
              <FloatLabel variant="on">
                <Select id="format" v-model="form.format" :options="DECK_FORMAT_OPTIONS" optionLabel="label" optionValue="value" fluid :disabled="isLockedEvent" />
                <label for="format">Formato</label>
              </FloatLabel>
            </div>
            <div class="col-12 md:col-4">
              <FloatLabel variant="on">
                <Select id="gameMode" v-model="form.gameMode" :options="EVENT_GAME_MODE_OPTIONS" optionLabel="label" optionValue="value" fluid :disabled="isLockedEvent || isGameModeLocked" />
                <label for="gameMode">Modo de jogo</label>
              </FloatLabel>
            </div>
            <div class="col-12 md:col-4">
              <FloatLabel variant="on">
                <Select id="pairingType" v-model="form.pairingType" :options="EVENT_PAIRING_OPTIONS" optionLabel="label" optionValue="value" fluid :disabled="isLockedEvent" />
                <label for="pairingType">Pareamento</label>
              </FloatLabel>
            </div>
          </div>

          <Message v-if="!isLockedEvent" severity="secondary" :closable="false">
            {{ gameModeHelperText }}
          </Message>

          <div class="grid">
            <div class="col-12 md:col-6">
              <FloatLabel variant="on">
                <InputNumber id="maxPlayers" v-model="form.maxPlayers" fluid :min="2" :disabled="isLockedEvent" />
                <label for="maxPlayers">Maximo de players</label>
              </FloatLabel>
            </div>
          </div>

          <div>
            <FloatLabel variant="on">
              <DatePicker id="dateTime" v-model="form.dateTime" fluid showTime hourFormat="24" :disabled="isLockedEvent" />
              <label for="dateTime">Data e hora</label>
            </FloatLabel>
          </div>

          <div class="flex justify-content-end gap-2 flex-wrap">
            <Button type="button" label="Voltar" severity="secondary" @click="$router.push('/events')" />
            <Button v-if="isEditMode && !isLockedEvent" type="button" label="Excluir" severity="danger" @click="removeEvent" />
            <Button v-if="!isEditMode" type="button" label="Salvar rascunho" severity="secondary" :loading="loading" @click="saveEvent(true)" />
            <Button type="button" :label="isEditMode ? 'Salvar' : 'Agendar evento'" :loading="loading" :disabled="isLockedEvent" @click="saveEvent(false)" />
          </div>
        </form>
      </template>
    </Card>
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
import { DECK_FORMAT_LABELS, DECK_FORMAT_OPTIONS, EVENT_GAME_MODE_OPTIONS, EVENT_PAIRING_OPTIONS } from '@/constants/options'
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
const eventStatus = ref('DRAFT')

const COMMANDER_MULTIPLAYER_FORMATS = ['COMMANDER', 'COMMANDER_500', 'COMMANDER_250', 'COMMANDER_15']

const isEditMode = computed(() => Boolean(route.params.id))
const isLockedEvent = computed(() => isEditMode.value && ['ONGOING', 'FINISHED', 'COMPLETED', 'CANCELLED'].includes(eventStatus.value))
const isGameModeLocked = computed(() => form.format !== 'CUSTOM')
const gameModeHelperText = computed(() => {
  if (form.format === 'CUSTOM') {
    return 'Formato Custom permite escolher livremente entre duelo 1x1 e commander multiplayer.'
  }

  if (COMMANDER_MULTIPLAYER_FORMATS.includes(form.format)) {
    return `Formato ${DECK_FORMAT_LABELS[form.format]} sempre usa commander multiplayer.`
  }

  if (form.format === 'COMMANDER_DUEL') {
    return 'Commander Duel sempre usa duelo 1x1.'
  }

  return `Formato ${DECK_FORMAT_LABELS[form.format] || form.format} sempre usa duelo 1x1.`
})

watch(
  () => form.format,
  (format) => {
    form.gameMode = resolveGameModeForFormat(format, form.gameMode)
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
    eventStatus.value = data.status || 'DRAFT'
    form.name = data.name || ''
    form.description = data.description || ''
    form.dateTime = data.dateTime ? new Date(data.dateTime) : null
    form.format = data.format || 'CUSTOM'
    form.pairingType = data.pairingType || 'SWISS'
    form.gameMode = resolveGameModeForFormat(data.format || 'CUSTOM', data.gameMode || 'ONE_VS_ONE')
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

async function saveEvent(isDraft = false) {
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

    if (!isDraft && form.dateTime < new Date()) {
      throw new Error('Evento agendado precisa ter data futura.')
    }

    const payload = {
      name: form.name,
      description: form.description,
      dateTime: form.dateTime?.toISOString(),
      format: form.format,
      pairingType: form.pairingType,
      gameMode: resolveGameModeForFormat(form.format, form.gameMode),
      maxPlayers: form.maxPlayers || undefined,
      isDraft,
    }

    if (isEditMode.value) {
      await updateEvent(route.params.id, payload)
      toast.add({ severity: 'success', summary: 'Evento atualizado', detail: 'As alteracoes foram salvas.', life: 2500 })
    } else {
      await createEvent(payload)
      toast.add({ severity: 'success', summary: 'Evento criado', detail: isDraft ? 'O evento foi salvo como rascunho.' : 'O evento foi agendado.', life: 2500 })
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
