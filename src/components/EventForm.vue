<template>
  <div class="flex justify-content-center align-items-center">
    <div class="card p-4 shadow-8 border-round-lg w-30rem">
      <h2 class="text-center mb-4">
        {{ isEditMode ? 'Editar Evento' : 'Criar Evento' }}
      </h2>

      <form @submit.prevent="onFormSubmit">
        <!-- Nome -->
        <div class="mb-3">
          <FloatLabel variant="on">
            <InputText fluid id="name" v-model="form.name" required />
            <label for="name">Nome do Evento</label>
          </FloatLabel>
        </div>

        <!-- Descrição -->
        <div class="mb-3">
          <FloatLabel variant="on">
            <Textarea
              fluid
              id="description"
              v-model="form.description"
              rows="4"
              style="resize: none"
            />
            <label for="description">Descrição (opcional)</label>
          </FloatLabel>
        </div>

        <!-- Linha: modos -->
        <div class="grid mb-3">
          <div class="col-6">
            <FloatLabel variant="on">
              <Select
                fluid
                v-model="form.gameMode"
                inputId="gamemode"
                :options="getGamesModes()"
                optionLabel="name"
                optionValue="code"
                required
              />
              <label for="gamemode">Modo de Jogo</label>
            </FloatLabel>
          </div>

          <div class="col-6">
            <FloatLabel variant="on">
              <Select
                fluid
                v-model="form.paringMode"
                inputId="paring"
                :options="getParingModes()"
                optionLabel="name"
                optionValue="code"
                required
              />
              <label for="paring">Pareamento</label>
            </FloatLabel>
          </div>
        </div>

        <!-- Linha: data e hora -->
        <div class="grid mb-3">
          <div class="col-6">
            <FloatLabel variant="on">
              <DatePicker
                inputId="date"
                v-model="form.date"
                dateFormat="dd/mm/yy"
                showIcon
                fluid
                iconDisplay="input"
                required
              />
              <label for="date">Data</label>
            </FloatLabel>
          </div>

          <div class="col-6">
            <FloatLabel variant="on">
              <DatePicker
                v-model="form.time"
                showIcon
                fluid
                iconDisplay="input"
                timeOnly
                required
              >
                <template #inputicon="slotProps">
                  <i class="pi pi-clock cursor-pointer" @click="slotProps.clickCallback" />
                </template>
              </DatePicker>
              <label for="time">Hora</label>
            </FloatLabel>
          </div>
        </div>

        <!-- Botões -->
        <div class="flex justify-content-between gap-2 mt-3">
          <Button
            v-if="isEditMode"
            label="Excluir"
            icon="pi pi-trash"
            severity="danger"
            @click="deleteEvent"
          />
          <Button
            type="submit"
            :loading="loading"
            :label="isEditMode ? 'Salvar Alterações' : 'Criar Evento'"
            icon="pi pi-check"
            class="flex-grow-1"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import FloatLabel from 'primevue/floatlabel'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import api from '@/api'

export default {
  components: { InputText, Button, FloatLabel, Textarea, Select, DatePicker },

  data() {
    return {
      form: {
        name: '',
        description: '',
        date: null,
        time: null,
        paringMode: null,
        gameMode: null,
      },
      loading: false,
      eventId: null,
    }
  },

  computed: {
    isEditMode() {
      return !!this.$route.params.id
    },
  },

  async mounted() {
    if (this.isEditMode) {
      this.loading = true
      try {
        const id = this.$route.params.id
        this.eventId = id

        const res = await api.get(`/events/${id}`)
        const ev = res.data

        const dateObj = new Date(ev.dateTime)
        this.form = {
          name: ev.name,
          description: ev.description,
          date: dateObj,
          time: dateObj,
          paringMode: ev.paring,
          gameMode: ev.gamemode,
        }
      } catch (e) {
        this.$toast.add({
          severity: 'error',
          summary: 'Erro ao carregar evento',
          detail: 'Não foi possível carregar os dados do evento.',
          life: 3000,
        })
        console.error(e)
      } finally {
        this.loading = false
      }
    }
  },

  methods: {
    async onFormSubmit() {
      this.loading = true
      try {
        const { date, time } = this.form
        const combined = new Date(date)
        combined.setHours(time.getHours())
        combined.setMinutes(time.getMinutes())

        const payload = {
          name: this.form.name,
          description: this.form.description,
          dateTime: combined.toISOString(),
          paring: this.form.paringMode,
          gamemode: this.form.gameMode,
        }

        if (this.isEditMode) {
          await api.put(`/events/${this.eventId}`, payload)
          this.$toast.add({
            severity: 'success',
            summary: 'Evento atualizado!',
            detail: 'As alterações foram salvas com sucesso!',
            life: 3000,
          })
        } else {
          await api.post('/events', payload)
          this.$toast.add({
            severity: 'success',
            summary: 'Evento criado!',
            detail: 'Seu evento foi criado com sucesso!',
            life: 3000,
          })
        }

        this.$router.push('/events')
      } catch (e) {
        this.$toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao salvar evento. Tente novamente.',
          life: 3000,
        })
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async deleteEvent() {
      if (!confirm('Tem certeza que deseja excluir este evento?')) return
      try {
        await api.delete(`/events/${this.eventId}`)
        this.$toast.add({
          severity: 'success',
          summary: 'Evento excluído!',
          detail: 'O evento foi removido com sucesso.',
          life: 3000,
        })
        this.$router.push('/events')
      } catch (e) {
        this.$toast.add({
          severity: 'error',
          summary: 'Erro ao excluir',
          detail: 'Não foi possível excluir o evento.',
          life: 3000,
        })
        console.error(e)
      }
    },

    getGamesModes() {
      return [
        { name: 'Commander 15', code: 'commander15' },
        { name: 'Commander 250', code: 'commander250' },
        { name: 'Commander 500', code: 'commander500' },
        { name: 'Commander Bracket 2', code: 'commander2' },
        { name: 'Padrão', code: 'standard' },
        { name: 'Moderno', code: 'modern' },
        { name: 'Pioneer', code: 'pioneer' },
        { name: 'Pauper', code: 'pauper' },
        { name: 'Legacy', code: 'legacy' },
        { name: 'Vintage', code: 'vintage' },
        { name: 'Selado', code: 'sealed' },
        { name: 'Draft', code: 'draft' },
      ]
    },

    getParingModes() {
      return [
        { name: 'Suiço', code: 'swiss' },
        { name: 'Todos Enfrentam Todos', code: 'round-robin' },
        { name: 'Eliminatório', code: 'single-elimination' },
        { name: 'Eliminatório Duplo', code: 'double-elimination' },
      ]
    },
  },
}
</script>
