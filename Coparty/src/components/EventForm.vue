<template>
  <div class="flex justify-content-center align-items-center">
    <div class="card p-4 shadow-8 border-round-lg w-30rem h-30rem m-auto">
      <h2 class="text-center mb-4">Criar Evento</h2>

      <form @submit.prevent="onFormeSubmit">
        <!-- Nome do Evento -->
        <div class="mb-3">
          <FloatLabel variant="on">
            <InputText fluid id="name" v-model="form.name" required />
            <label for="name">Nome</label>
          </FloatLabel>
        </div>

        <!-- Senha -->
        <div class="mb-3">
          <FloatLabel variant="on">
            <Password fluid id="password" v-model="form.password" toggleMask :feedback="false" required />
            <label for="password">Senha</label>
          </FloatLabel>


        </div>

        <!-- Botão -->
        <Button type="submit" label="Entrar" icon="pi pi-sign-in" class="w-full mt-3" />
      </form>
    </div>
  </div>
</template>


<script>
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import FloatLabel from 'primevue/floatlabel';


export default {
  components: { InputText, Password, Button, FloatLabel },
  data() {
    return {
      form: {
        name: '',
        description: '',
        date: new Date().toISOString(),
      }
    }
  },
  methods: {
    onFormeSubmit() {
      console.log('Tentando login com:', this.form)
      // Aqui você chamaria sua API de autenticação
    }
  }
}
</script>
