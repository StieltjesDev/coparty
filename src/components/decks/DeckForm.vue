<template>
  <div class="page-shell">
    <Card class="page-card form-card">
      <template #title>{{ isEditMode ? 'Editar deck' : 'Novo deck' }}</template>
      <template #content>
        <div class="app-highlight app-highlight--accent mb-4">
          <div>
            <span class="app-highlight-label">Cadastro do deck</span>
            <strong class="app-highlight-title">{{ showCommanderField ? 'Informe o comandante para formatos Commander' : 'Mantenha a lista pronta para inscricoes' }}</strong>
          </div>
          <p class="app-highlight-copy">Decks inativos continuam cadastrados, mas ficam fora de uso ate voce reativar.</p>
        </div>

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

          <div v-if="showCommanderField">
            <FloatLabel variant="on">
              <InputText id="commander" v-model="form.commander" fluid />
              <label for="commander">Comandante</label>
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
            <Button
              v-if="isEditMode"
              type="button"
              :label="form.isActive ? 'Desativar' : 'Reativar'"
              :icon="form.isActive ? 'pi pi-ban' : 'pi pi-refresh'"
              :severity="form.isActive ? 'warn' : 'success'"
              :disabled="loading"
              v-tooltip.top="form.isActive ? 'Desativar deck' : 'Reativar deck'"
              @click="toggleDeckActiveState"
            />
            <Button type="submit" :label="isEditMode ? 'Salvar' : 'Criar deck'" :loading="loading" />
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
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tooltip from 'primevue/tooltip'
import { useConfirm } from 'primevue/useconfirm'
import { DECK_FORMAT_OPTIONS } from '@/constants/options'
import { createDeck, getDeck, setDeckActiveState, updateDeck } from '@/services/decks'
import { getErrorMessage } from '@/services/error'
import { useToast } from 'primevue/usetoast'

const vTooltip = Tooltip

const route = useRoute()
const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const loading = ref(false)
const form = reactive({
  name: '',
  format: 'MODERN',
  commander: '',
  link: '',
  isActive: true,
})

const isEditMode = computed(() => Boolean(route.params.id))
const showCommanderField = computed(() => ['COMMANDER', 'COMMANDER_DUEL'].includes(form.format))

watch(
  () => form.format,
  (format) => {
    if (!['COMMANDER', 'COMMANDER_DUEL'].includes(format)) {
      form.commander = ''
    }
  }
)

onMounted(async () => {
  if (!isEditMode.value) return

  loading.value = true
  try {
    const { data } = await getDeck(route.params.id)
    form.name = data.name || ''
    form.format = data.format || 'MODERN'
    form.commander = data.commander || ''
    form.link = data.link || ''
    form.isActive = data.isActive ?? true
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
      commander: showCommanderField.value ? form.commander || null : null,
      link: form.link || null,
      isActive: form.isActive,
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

function toggleDeckActiveState() {
  const nextIsActive = !form.isActive
  const actionLabel = nextIsActive ? 'reativar' : 'desativar'

  confirm.require({
    message: nextIsActive
      ? 'Deseja reativar este deck? Ele voltara a ficar disponivel para uso.'
      : 'Deseja desativar este deck? Ele continuara cadastrado, mas ficara indisponivel para uso.',
    header: nextIsActive ? 'Reativar deck' : 'Desativar deck',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: nextIsActive ? 'Reativar' : 'Desativar',
    rejectLabel: 'Cancelar',
    accept: async () => {
      loading.value = true
      try {
        await setDeckActiveState(route.params.id, {
          name: form.name,
          format: form.format,
          commander: showCommanderField.value ? form.commander || null : null,
          link: form.link || null,
        }, nextIsActive)
        form.isActive = nextIsActive
        toast.add({
          severity: 'success',
          summary: nextIsActive ? 'Deck reativado' : 'Deck desativado',
          detail: nextIsActive ? 'O deck voltou a ficar disponivel para uso.' : 'O deck foi marcado como inativo.',
          life: 2500,
        })
        await router.push('/decks')
      } catch (error) {
        toast.add({ severity: 'error', summary: `Erro ao ${actionLabel}`, detail: getErrorMessage(error, `Nao foi possivel ${actionLabel} o deck.`), life: 4000 })
      } finally {
        loading.value = false
      }
    },
  })
}
</script>
