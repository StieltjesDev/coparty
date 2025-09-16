<script setup>
import { ref } from 'vue'
import SuccessButton from './buttons/SuccessButton.vue'

const email = ref('')
const senha = ref('')
const errors = ref({})

// Validação simples
function validate() {
  errors.value = {}

  if (!email.value) {
    errors.value.email = 'O e-mail é obrigatório.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Digite um e-mail válido.'
  }

  if (!senha.value) {
    errors.value.senha = 'A senha é obrigatória.'
  } else if (senha.value.length < 6) {
    errors.value.senha = 'A senha deve ter pelo menos 6 caracteres.'
  }

  return Object.keys(errors.value).length === 0
}

// Submeter formulário
function submitForm() {
  if (!validate()) return

  const usuario = {
    email: email.value,
    senha: senha.value
  }

  console.log('Tentando login com:', usuario)
  alert('Login realizado com sucesso!')

  // Limpa os campos
  email.value = ''
  senha.value = ''
}
</script>

<template>
  <div class="container">
    <form @submit.prevent="submitForm" class="login-form">
      <h2>Login</h2>
      <!-- E-mail -->
      <div class="input-group">
        <label for="email">E-mail:</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="Digite seu e-mail"
        />
        <p v-if="errors.email" class="error">{{ errors.email }}</p>
      </div>

      <!-- Senha -->
      <div class="input-group">
        <label for="senha">Senha:</label>
        <input
          id="senha"
          v-model="senha"
          type="password"
          placeholder="Digite sua senha"
        />
        <p v-if="errors.senha" class="error">{{ errors.senha }}</p>
      </div>

      <!-- Botão -->
      <SuccessButton>Entrar</SuccessButton>
    </form>
  </div>
</template>

<style scoped>
h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.container {
  max-width: 400px;
  margin: auto;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.error {
  color: red;
  font-size: 0.9rem;
}
</style>