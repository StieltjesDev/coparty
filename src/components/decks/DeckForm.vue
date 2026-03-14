<template>
  <div class="page-shell">
    <Card class="page-card form-card">
      <template #title>{{ isEditMode ? 'Editar deck' : 'Novo deck' }}</template>
      <template #content>
        <form class="flex flex-column gap-3" @submit.prevent="saveDeck">
          <div>
            <FloatLabel variant="on">
              <InputText id="name" v-model="form.name" fluid />
              <label for="name">Nome</label>
            </FloatLabel>
          </div>

          <div>
            <FloatLabel variant="on">
              <Select id="format" v-model="form.format" :options="DECK_FORMAT_OPTIONS" optionLabel="label" optionValue="value" fluid />
              <label for="format">Formato</label>
            </FloatLabel>
          </div>

          <div>
            <FloatLabel variant="on">
              <InputText id="commander" v-model="form.commander" fluid />
              <label for="commander">Commander (opcional)</label>
            </FloatLabel>
          </div>

          <div>
            <FloatLabel variant="on">
              <InputText id="link" v-model="form.link" fluid />
              <label for="link">Link (opcional)</label>
            </FloatLabel>
          </div>

          <div class="flex gap-2 justify-content-end flex-wrap">
            <Button type="button" label="Voltar" severity="secondary" @click="$router.push('/decks')" />
            <Button type="submit" :label="isEditMode ? 'Salvar' : 'Criar deck'" :loading="loading" />
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
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { DECK_FORMAT_OPTIONS } from '@/constants/options'
import { createDeck, getDeck, updateDeck } from '@/services/decks'
import { getErrorMessage } from '@/services/error'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const loading = ref(false)
const form = reactive({
  name: '',
  format: 'MODERN',
  commander: '',
  link: '',
})

const isEditMode = computed(() => Boolean(route.params.id))

onMounted(async () => {
  if (!isEditMode.value) return

  loading.value = true
  try {
    const { data } = await getDeck(route.params.id)
    form.name = data.name || ''
    form.format = data.format || 'MODERN'
    form.commander = data.commander || ''
    form.link = data.link || ''
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: getErrorMessage(error, 'Nao foi possivel carregar o deck.'), life: 4000 })
  } finally {
    loading.value = false
  }
})

async function saveDeck() {
  loading.value = true
  try {
    const payload = {
      name: form.name,
      format: form.format,
      commander: form.commander || null,
      link: form.link || null,
    }

    if (isEditMode.value) {
      await updateDeck(route.params.id, payload)
      toast.add({ severity: 'success', summary: 'Deck atualizado', detail: 'As alteracoes foram salvas.', life: 2500 })
    } else {
      await createDeck(payload)
      toast.add({ severity: 'success', summary: 'Deck criado', detail: 'O deck foi cadastrado.', life: 2500 })
    }

    await router.push('/decks')
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro ao salvar', detail: getErrorMessage(error, 'Nao foi possivel salvar o deck.'), life: 4000 })
  } finally {
    loading.value = false
  }
}
</script>
