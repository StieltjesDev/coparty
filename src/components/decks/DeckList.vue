<template>
  <div class="page-shell page-shell--wide">
    <Card class="w-full form-card">
      <template #title>
        <div class="decks-header flex justify-content-between align-items-center gap-3 flex-wrap">
          <span>Meus decks</span>
          <Button class="decks-header__action" label="Novo deck" icon="pi pi-plus" @click="$router.push('/decks/create')" />
        </div>
      </template>

      <template #content>
        <div class="app-highlight app-highlight--accent mb-4">
          <div>
            <span class="app-highlight-label">Colecao</span>
            <strong class="app-highlight-title">{{ decks.length }} deck(s) no seu arsenal</strong>
          </div>
          <p class="app-highlight-copy">Desative decks que voce quer preservar sem expor nas inscricoes e reative quando quiser voltar a usar.</p>
        </div>

        <div v-if="loading" class="text-center py-4">Carregando decks...</div>
        <Message v-else-if="!decks.length" severity="info" :closable="false">
          Voce ainda nao cadastrou decks.
        </Message>
        <div v-else class="table-surface">
          <DataTable :value="decks" dataKey="_id" stripedRows>
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
                <Button
                  size="small"
                  :icon="data.isActive ? 'pi pi-ban' : 'pi pi-refresh'"
                  :severity="data.isActive ? 'warn' : 'success'"
                  v-tooltip.top="data.isActive ? 'Desativar deck' : 'Reativar deck'"
                  @click="toggleDeckActiveState(data)"
                />
              </div>
            </template>
          </Column>
          </DataTable>
        </div>
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
import Tooltip from 'primevue/tooltip'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { listMyDecks, setDeckActiveState } from '@/services/decks'
import { getErrorMessage } from '@/services/error'

const vTooltip = Tooltip

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

function toggleDeckActiveState(deck) {
  const nextIsActive = !deck.isActive
  const actionLabel = nextIsActive ? 'reativar' : 'desativar'
  const titleLabel = nextIsActive ? 'Reativar deck' : 'Desativar deck'
  const successLabel = nextIsActive ? 'Deck reativado' : 'Deck desativado'
  const successDetail = nextIsActive
    ? 'O deck voltou a ficar disponivel para uso.'
    : 'O deck foi marcado como inativo.'

  confirm.require({
    message: nextIsActive
      ? 'Deseja reativar este deck? Ele voltara a ficar disponivel para uso.'
      : 'Deseja desativar este deck? Ele continuara cadastrado, mas ficara indisponivel para uso.',
    header: titleLabel,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: nextIsActive ? 'Reativar' : 'Desativar',
    rejectLabel: 'Cancelar',
    accept: async () => {
      try {
        await setDeckActiveState(
          deck._id,
          {
            name: deck.name,
            format: deck.format,
            commander: deck.commander || null,
            link: deck.link || null,
          },
          nextIsActive
        )
        toast.add({ severity: 'success', summary: successLabel, detail: successDetail, life: 2500 })
        await loadDecks()
      } catch (error) {
        toast.add({ severity: 'error', summary: `Falha ao ${actionLabel}`, detail: getErrorMessage(error, `Nao foi possivel ${actionLabel} o deck.`), life: 4000 })
      }
    },
  })
}

onMounted(loadDecks)
</script>

<style scoped>
@media (max-width: 640px) {
  .decks-header {
    align-items: stretch !important;
  }

  .decks-header__action {
    width: 100%;
  }
}
</style>
