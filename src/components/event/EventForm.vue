<template>
  <div class="page-shell">
    <Card class="page-card form-card">
      <template #title>{{ isEditMode ? 'Editar evento' : 'Novo evento' }}</template>
      <template #content>
        <form class="flex flex-column gap-3" @submit.prevent="saveEvent">
          <div>
            <FloatLabel variant="on">
              <InputText id="name" v-model="form.name" fluid />
              <label for="name">Nome</label>
            </FloatLabel>
          </div>

          <div>
            <FloatLabel variant="on">
              <Textarea id="description" v-model="form.description" rows="4" autoResize fluid />
              <label for="description">Descricao</label>
            </FloatLabel>
          </div>

          <div class="grid">
            <div class="col-12 md:col-6">
              <FloatLabel variant="on">
                <Select id="gameMode" v-model="form.gameMode" :options="EVENT_GAME_MODE_OPTIONS" optionLabel="label" optionValue="value" fluid />
                <label for="gameMode">Modo de jogo</label>
              </FloatLabel>
            </div>
            <div class="col-12 md:col-6">
              <FloatLabel variant="on">
                <Select id="pairingType" v-model="form.pairingType" :options="EVENT_PAIRING_OPTIONS" optionLabel="label" optionValue="value" fluid />
                <label for="pairingType">Pareamento</label>
              </FloatLabel>
            </div>
          </div>

          <div class="grid">
            <div class="col-12 md:col-6">
              <FloatLabel variant="on">
                <InputNumber id="maxPlayers" v-model="form.maxPlayers" fluid :min="2" />
                <label for="maxPlayers">Maximo de players</label>
              </FloatLabel>
            </div>
          </div>

          <div>
            <FloatLabel variant="on">
              <DatePicker id="dateTime" v-model="form.dateTime" fluid showTime hourFormat="24" />
              <label for="dateTime">Data e hora</label>
            </FloatLabel>
          </div>

          <div class="flex justify-content-end gap-2 flex-wrap">
            <Button type="button" label="Voltar" severity="secondary" @click="$router.push('/events')" />
            <Button v-if="isEditMode" type="button" label="Excluir" severity="danger" @click="removeEvent" />
            <Button v-if="!isEditMode" type="button" label="Salvar rascunho" severity="secondary" :loading="loading" @click="saveEvent(true)" />
            <Button type="button" :label="isEditMode ? 'Salvar' : 'Agendar evento'" :loading="loading" @click="saveEvent(false)" />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import DatePicker from 'primevue/datepicker'
import FloatLabel from 'primevue/floatlabel'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { EVENT_GAME_MODE_OPTIONS, EVENT_PAIRING_OPTIONS } from '@/constants/options'
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
  pairingType: 'SWISS',
  gameMode: 'ONE_VS_ONE',
  maxPlayers: null,
})

const isEditMode = computed(() => Boolean(route.params.id))

onMounted(async () => {
  if (!isEditMode.value) {
    form.dateTime = new Date(Date.now() + 3600_000)
    return
  }

  loading.value = true
  try {
    const { data } = await getEvent(route.params.id)
    form.name = data.name || ''
    form.description = data.description || ''
    form.dateTime = data.dateTime ? new Date(data.dateTime) : null
    form.pairingType = data.pairingType || 'SWISS'
    form.gameMode = data.gameMode || 'ONE_VS_ONE'
    form.maxPlayers = data.maxPlayers || null
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: getErrorMessage(error, 'Nao foi possivel carregar o evento.'), life: 4000 })
  } finally {
    loading.value = false
  }
})

async function saveEvent(isDraft = false) {
  loading.value = true
  try {
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
      pairingType: form.pairingType,
      gameMode: form.gameMode,
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
