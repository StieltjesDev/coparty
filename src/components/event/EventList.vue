<template>
  <div class="page-shell page-shell--wide">
    <div class="w-full flex flex-column gap-4">
      <div class="flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2 class="m-0 page-title">Eventos</h2>
          <small class="text-color-secondary">Acompanhe torneios 1v1 e Commander multiplayer.</small>
        </div>
        <Button label="Criar evento" icon="pi pi-plus" @click="$router.push('/events/create')" />
      </div>

      <div v-if="loading" class="text-center py-5">Carregando eventos...</div>
      <Message v-else-if="!events.length" severity="info" :closable="false">
        Nenhum evento encontrado. Crie o primeiro evento do beta para iniciar os testes.
      </Message>
      <div v-else class="grid">
        <div v-for="event in events" :key="event._id" class="col-12 md:col-6 xl:col-4">
          <Card class="event-card h-full">
            <template #title>
              <div class="flex justify-content-between align-items-center gap-2 flex-wrap">
                <span>{{ event.name }}</span>
                <Tag :value="event.status" :severity="event.status === 'SCHEDULED' ? 'info' : event.status === 'ONGOING' ? 'success' : 'contrast'" />
              </div>
            </template>
            <template #subtitle>
              <div class="flex gap-2 flex-wrap">
                <Tag :value="event.gameMode" severity="warn" />
                <Tag v-if="isOrganizer(event)" value="Organizador" severity="success" />
              </div>
            </template>
            <template #content>
              <div class="flex flex-column gap-2">
                <span><strong>Data:</strong> {{ formatDateTime(event.dateTime) }}</span>
                <span><strong>Pareamento:</strong> {{ event.pairingType }}</span>
                <span><strong>Inscritos:</strong> {{ event.qntPlayers || 0 }}</span>
                <span><strong>Descricao:</strong> {{ event.description || 'Sem descricao' }}</span>
              </div>
            </template>
            <template #footer>
              <Button label="Ver evento" icon="pi pi-arrow-right" class="w-full" @click="$router.push(`/events/${event._id}`)" />
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { listEvents } from '@/services/events'
import { getErrorMessage } from '@/services/error'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const toast = useToast()
const loading = ref(false)
const events = ref([])

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
