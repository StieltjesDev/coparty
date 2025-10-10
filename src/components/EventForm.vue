<template>
  <div class="flex justify-content-center align-items-center">
    <div class="card p-4 shadow-8 border-round-lg w-30rem h-30rem m-auto">
      <h2 class="text-center mb-4">Criar Evento</h2>

      <form @submit.prevent="onFormeSubmit">
        <!-- Nome do Evento -->
        <div class="mb-3">
          <FloatLabel variant="on">
            <InputText fluid id="name" v-model="form.name" required />
            <label for="name">Nome do Evento</label>
          </FloatLabel>
        </div>

        <!-- Descrição -->
        <div class="mb-3">
          <FloatLabel variant="on">
            <Textarea fluid id="description" v-model="form.description" rows="5" cols="30" style="resize: none" />
            <label for="description">Descrição do Evento (Opcional)</label>
          </FloatLabel>
        </div>

        <div class="grid mb-3">
          <div class="col-6">
            <!-- Modo de Jogo -->
            <FloatLabel variant="on">
              <Select fluid v-model="form.gameMode" inputId="gamemode" :options="getGamesModes()" optionValue="code"
                optionLabel="name" required />
              <label for="gamemode">Modo de Jogo</label>
            </FloatLabel>
          </div>
          <div class="col-6">
            <!-- Tipos Pareamento de Jogo -->
            <FloatLabel variant="on">
              <Select fluid v-model="form.paringMode" inputId="paring" :options="getParingModes()" optionValue="code"
                optionLabel="name" required />
              <label for="paring">Modo de Pareamento</label>
            </FloatLabel>
          </div>
        </div>

        <div class="grid mb-3">
          <div class="col-6">
            <!-- Data do Evento -->
            <FloatLabel variant="on">
              <DatePicker inputId="date" v-model="form.date" dateFormat="dd/mm/yy" showIcon fluid iconDisplay="input" required />
              <label for="date">Data</label>
            </FloatLabel>
          </div>
          <div class="col-6">
            <!-- Hora do Evento -->
            <FloatLabel variant="on">
              <DatePicker v-model="form.time" showIcon fluid iconDisplay="input" timeOnly required>
                <template #inputicon="slotProps">
                  <i class="pi pi-clock" @click="slotProps.clickCallback" />
                </template>
              </DatePicker>
              <label for="time">Horário</label>
            </FloatLabel>
          </div>
        </div>

        <!-- Botão -->
        <Button type="submit" :loading="loading" label="Criar Evento" class="w-full mt-3" />
      </form>
    </div>
  </div>
</template>


<script>
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import FloatLabel from 'primevue/floatlabel';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import api from '@/api'



export default {
  components: { InputText, Password, Button, FloatLabel, Textarea, Select, DatePicker },
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
      errorMessage: ''
    }
  },
  methods: {
    async onFormeSubmit() {
      this.loading = true
      this.errorMessage = ''

      try {
        const { date, time } = this.form;
        const combined = new Date(date);
        combined.setHours(time.getHours());
        const data = {
          name: this.form.name,
          description: this.form.description,
          dateTime: combined.toISOString(),
          paring: this.form.paringMode,
          gamemode: this.form.gameMode,
        }
        await api.post('/events/', data)
        this.$toast.add({
          severity: 'success',
          summary: 'Evento criado!',
          detail: 'Seu evento foi criado com sucesso!',
          life: 3000
        })
        // redireciona (caso use vue-router)
        this.$router.push('/events')
      } catch (e) {
        this.$toast.add({
          severity: 'error',
          summary: 'Erro ao Criar Evento',
          detail: "Erro ao criar evento. Tente novamente mais tarde.",
          life: 3000
        })
        console.error(e)
      } finally {
        this.loading = false
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
        { name: 'Draft', code: 'draft' }
      ];
    },
    getParingModes() {
      return [
        { name: 'Suiço', code: 'swiss' },
        { name: 'Todos Enfrentam Todos', code: 'round-robin' },
        { name: 'Eliminatorio', code: 'single-elimination' },
        { name: 'Eliminatorio Duplo', code: 'double-elimination' }
      ];
    }
  }

}
</script>
