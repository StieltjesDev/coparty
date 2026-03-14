<template>
  <div class="page-shell page-shell--wide">
    <Card class="w-full form-card">
      <template #title>Painel admin</template>
      <template #content>
        <div class="flex flex-column gap-4">
          <Message severity="info" :closable="false">
            Rebuild serve para reprocessar ratings a partir dos resultados persistidos. Os standings continuam derivados na leitura.
          </Message>

          <div class="grid">
            <div class="col-12 md:col-6 xl:col-3">
              <Button label="Rebuild global" class="w-full" :loading="loading === 'global'" @click="runAction('global')" />
            </div>
            <div class="col-12 md:col-6 xl:col-3">
              <FloatLabel variant="on">
                <InputText id="eventId" v-model="form.eventId" fluid />
                <label for="eventId">Event ID</label>
              </FloatLabel>
            </div>
            <div class="col-12 md:col-6 xl:col-2">
              <Button label="Rebuild evento" class="w-full" :loading="loading === 'event'" @click="runAction('event')" />
            </div>
            <div class="col-12 md:col-6 xl:col-2">
              <FloatLabel variant="on">
                <InputNumber id="round" v-model="form.round" :min="1" fluid />
                <label for="round">Round</label>
              </FloatLabel>
            </div>
            <div class="col-12 xl:col-2">
              <Button label="Rebuild round" class="w-full" :loading="loading === 'round'" @click="runAction('round')" />
            </div>
          </div>

          <div class="grid">
            <div class="col-12 md:col-8">
              <FloatLabel variant="on">
                <InputText id="matchId" v-model="form.matchId" fluid />
                <label for="matchId">Match ID</label>
              </FloatLabel>
            </div>
            <div class="col-12 md:col-4">
              <Button label="Rebuild match" class="w-full" :loading="loading === 'match'" @click="runAction('match')" />
            </div>
          </div>

          <Card v-if="lastResult" class="form-card">
            <template #title>Ultimo resultado</template>
            <template #content>
              <pre class="result-box">{{ JSON.stringify(lastResult, null, 2) }}</pre>
            </template>
          </Card>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import FloatLabel from 'primevue/floatlabel'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import { rebuildAll, rebuildEvent, rebuildMatch, rebuildRound } from '@/services/admin'
import { getErrorMessage } from '@/services/error'

const toast = useToast()
const loading = ref(null)
const lastResult = ref(null)
const form = reactive({
  eventId: '',
  round: 1,
  matchId: '',
})

async function runAction(type) {
  loading.value = type
  try {
    let response

    if (type === 'global') response = await rebuildAll()
    if (type === 'event') response = await rebuildEvent(form.eventId)
    if (type === 'round') response = await rebuildRound(form.eventId, form.round)
    if (type === 'match') response = await rebuildMatch(form.matchId)

    lastResult.value = response.data
    toast.add({ severity: 'success', summary: 'Rebuild concluido', detail: 'Os dados competitivos foram reprocessados.', life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Falha no rebuild', detail: getErrorMessage(error, 'Nao foi possivel executar a acao administrativa.'), life: 4000 })
  } finally {
    loading.value = null
  }
}
</script>

<style scoped>
.result-box {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
