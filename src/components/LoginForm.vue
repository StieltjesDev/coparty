<template>
  <div class="flex justify-content-center align-items-center">
    <div class="card p-4 shadow-8 border-round-lg">
      <h2 class="text-center mb-4">Login</h2>

      <form @submit.prevent="onFormeSubmit">
        <!-- E-mail -->
        <div class="mb-3">
          <FloatLabel variant="on">
            <InputText fluid id="email" v-model="form.email" type="email" required />
            <label for="email">E-mail</label>
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
        email: '',
        password: ''
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
