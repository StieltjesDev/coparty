<template>
  <div class="flex justify-content-center align-items-center">
    <div class="card p-4 shadow-2 border-round-lg w-25rem">
      <h2 class="text-center mb-4">Login</h2>

      <form @submit.prevent="login">
        <!-- E-mail -->
        <div class="mb-3">
          <label for="email" class="block mb-2">E-mail</label>
          <InputText
            id="email"
            v-model="form.email"
            type="email"
            class="w-full"
            placeholder="Digite seu e-mail"
            required
          />
        </div>

        <!-- Senha -->
        <div class="mb-3">
          <label for="password" class="block mb-2">Senha</label>
          <Password
            id="password"
            v-model="form.password"
            placeholder="Digite sua senha"
            toggleMask
            feedback="false"
            class="w-full"
            required
          />
        </div>

        <!-- Botão -->
        <Button
          type="submit"
          label="Entrar"
          icon="pi pi-sign-in"
          class="w-full mt-3"
        />
      </form>
    </div>
  </div>
</template>


<script>
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

export default {
  components: { InputText, Password, Button },
  data() {
    return {
      form: {
        email: '',
        password: ''
      }
    }
  },
  methods: {
    login() {
      console.log('Tentando login com:', this.form)
      // Aqui você chamaria sua API de autenticação
    }
  }
}
</script>
