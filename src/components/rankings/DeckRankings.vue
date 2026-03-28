<template>
  <div class="page-shell page-shell--wide">
    <Card class="w-full form-card">
      <template #title>Ranking de decks</template>
      <template #content>
        <div class="app-highlight app-highlight--accent mb-4">
          <div>
            <span class="app-highlight-label">Metagame</span>
            <strong class="app-highlight-title">Acompanhe os decks que mais rendem resultado</strong>
          </div>
          <p class="app-highlight-copy">Use os filtros para observar quais listas se destacam em cada modo de jogo e formato ativo.</p>
        </div>

        <div class="grid mb-3">
          <div class="col-12 md:col-4">
            <FloatLabel variant="on">
              <Select id="gameMode" v-model="filters.gameMode" :options="gameModes" optionLabel="label" optionValue="value" fluid />
              <label for="gameMode">Modo de jogo</label>
            </FloatLabel>
          </div>
          <div class="col-12 md:col-4">
            <FloatLabel variant="on">
              <Select id="format" v-model="filters.format" :options="formatOptions" optionLabel="label" optionValue="value" fluid showClear />
              <label for="format">Formato</label>
            </FloatLabel>
          </div>
          <div class="col-12 md:col-4 flex align-items-end">
            <Button label="Atualizar" class="w-full" @click="loadRankings" :loading="loading" />
          </div>
        </div>

        <Message v-if="!rankings.length && !loading" severity="info" :closable="false">Nenhum ranking encontrado.</Message>
        <div v-else class="desktop-table table-surface">
          <DataTable :value="rankings" dataKey="_id" stripedRows>
          <Column header="#">
            <template #body="{ index }">{{ index + 1 }}</template>
          </Column>
          <Column field="deckId.name" header="Deck" />
          <Column field="deckId.commander" header="Commander" />
          <Column header="Modo de jogo">
            <template #body="{ data }">{{ eventGameModeLabels[data.gameMode] || data.gameMode }}</template>
          </Column>
          <Column field="format" header="Formato" />
          <Column field="rating" header="Rating" />
          <Column field="matchesPlayed" header="Matches" />
          </DataTable>
        </div>
        <div class="mobile-card-list">
          <article v-for="(ranking, index) in rankings" :key="ranking._id" class="mobile-data-card">
            <div class="mobile-data-card__head">
              <div>
                <h3 class="mobile-data-card__title">#{{ index + 1 }} {{ ranking.deckId?.name || 'Deck' }}</h3>
                <p class="mobile-data-card__subtitle">{{ eventGameModeLabels[ranking.gameMode] || ranking.gameMode }}</p>
              </div>
            </div>

            <div class="mobile-data-grid">
              <div v-if="ranking.deckId?.commander" class="mobile-data-item">
                <span>Comandante</span>
                <strong>{{ ranking.deckId.commander }}</strong>
              </div>
              <div class="mobile-data-item">
                <span>Formato</span>
                <strong>{{ ranking.format }}</strong>
              </div>
              <div class="mobile-data-item">
                <span>Rating</span>
                <strong>{{ ranking.rating }}</strong>
              </div>
              <div class="mobile-data-item">
                <span>Matches</span>
                <strong>{{ ranking.matchesPlayed }}</strong>
              </div>
            </div>
          </article>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import FloatLabel from 'primevue/floatlabel'
import Message from 'primevue/message'
import Select from 'primevue/select'
import { DECK_FORMAT_OPTIONS, EVENT_GAME_MODE_LABELS as eventGameModeLabels, EVENT_GAME_MODE_OPTIONS } from '@/constants/options'
import { getErrorMessage } from '@/services/error'
import { getDeckRankings } from '@/services/rankings'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const loading = ref(false)
const rankings = ref([])
const gameModes = EVENT_GAME_MODE_OPTIONS
const formatOptions = DECK_FORMAT_OPTIONS
const filters = reactive({
  gameMode: 'ONE_VS_ONE',
  format: null,
})

async function loadRankings() {
  loading.value = true
  try {
    const { data } = await getDeckRankings({
      gameMode: filters.gameMode,
      format: filters.format || undefined,
    })
    rankings.value = data
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: getErrorMessage(error, 'Nao foi possivel carregar o ranking.'), life: 4000 })
  } finally {
    loading.value = false
  }
}

onMounted(loadRankings)
</script>

<style scoped>
@media (max-width: 640px) {
  .grid.mb-3 {
    margin-bottom: 1rem !important;
  }
}
</style>

