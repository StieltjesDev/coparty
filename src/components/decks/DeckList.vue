<template>
  <div class="page-shell page-shell--wide">
    <Card class="w-full form-card">
      <template #title>
        <div class="flex justify-content-between align-items-center gap-3 flex-wrap">
          <span>Meus decks</span>
          <Button label="Novo deck" icon="pi pi-plus" @click="$router.push('/decks/create')" />
        </div>
      </template>

      <template #content>
        <div v-if="loading" class="text-center py-4">Carregando decks...</div>
        <Message v-else-if="!decks.length" severity="info" :closable="false">
          Voce ainda nao cadastrou decks.
        </Message>
        <DataTable v-else :value="decks" dataKey="_id" stripedRows>
          <Column field="name" header="Nome" />
          <Column field="format" header="Formato" />
          <Column field="commander" header="Commander" />
          <Column header="Ativo">
            <template #body="{ data }">{{ data.isActive ? 'Sim' : 'Nao' }}</template>
          </Column>
          <Column header="Acoes" style="width: 12rem">
            <template #body="{ data }">
              <div class="flex gap-2 justify-content-end">
                <Button size="small" icon="pi pi-pencil" @click="$router.push(`/decks/${data._id}/edit`)" />
                <Button size="small" icon="pi pi-trash" severity="danger" @click="removeDeck(data._id)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Message from 'primevue/message'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { deleteDeckById, listMyDecks } from '@/services/decks'
import { getErrorMessage } from '@/services/error'

const confirm = useConfirm()
const toast = useToast()
const decks = ref([])
const loading = ref(false)

async function loadDecks() {
  loading.value = true
  try {
    const { data } = await listMyDecks()
    decks.value = data
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: getErrorMessage(error, 'Nao foi possivel carregar os decks.'), life: 4000 })
  } finally {
    loading.value = false
  }
}

function removeDeck(id) {
  confirm.require({
    message: 'Deseja remover este deck?',
    header: 'Excluir deck',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Excluir',
    rejectLabel: 'Cancelar',
    accept: async () => {
      try {
        await deleteDeckById(id)
        toast.add({ severity: 'success', summary: 'Deck removido', detail: 'O deck foi excluido.', life: 2500 })
        await loadDecks()
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Falha ao excluir', detail: getErrorMessage(error, 'Nao foi possivel excluir o deck.'), life: 4000 })
      }
    },
  })
}

onMounted(loadDecks)
</script>
