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
            <FloatLabel variant="on">
              <Select fluid v-model="form.gameMode" inputId="gamemode" :options="getGamesModes()" optionValue="code"
                optionLabel="name" required />
              <label for="gamemode">Modo de Jogo</label>
            </FloatLabel>
          </div>
          <div class="col-6">
            <FloatLabel variant="on">
              <Select fluid v-model="form.paringMode" inputId="paring" :options="getParingModes()" optionValue="code"
                optionLabel="name" required />
              <label for="paring">Modo de Pareamento</label>
            </FloatLabel>
          </div>
        </div>

        <div class="grid mb-3">
          <div class="col-6">
            <FloatLabel variant="on">
              <DatePicker inputId="date" v-model="form.date" dateFormat="dd/mm/yy" showIcon fluid iconDisplay="input" required />
              <label for="date">Data</label>
            </FloatLabel>
          </div>
          <div class="col-6">
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
        <Button type="submit" label="Criar Evento" class="w-full mt-3" />
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
      }
    }
  },
  methods: {
    onFormeSubmit() {
      console.log('Tentando login com:', this.form)
      // Aqui você chamaria sua API de autenticação
    },
    getGamesModes() {
      return [
        { name: 'Casual', code: '1' },
        { name: 'Competitivo', code: '2' },
        { name: 'Ranqueado', code: '3' }
      ];
    },
    getParingModes() {
      return [
        { name: 'Simples', code: '1' },
        { name: 'Dupla', code: '2' },
        { name: 'Tripla', code: '3' }
      ];
    }
  }

}
</script>
