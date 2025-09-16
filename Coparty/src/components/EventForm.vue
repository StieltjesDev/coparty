<script setup>
import { ref } from 'vue'

const nomeEvento = ref('')
const jogo = ref('')
const errors = ref({})

// Opções de exemplo para o select
const jogos = [
  { value: '1', label: 'Gigante Duas Cabeças' }
]

// Função de validação
function validate() {
  errors.value = {}

  if (nomeEvento.value.trim().length < 3) {
    errors.value.nomeEvento = 'O nome deve ter pelo menos 3 caracteres.'
  } else if (nomeEvento.value.trim().length > 50) {
    errors.value.nomeEvento = 'O nome deve ter no máximo 50 caracteres.'
  }

  if (!jogo.value) {
    errors.value.jogo = 'Selecione um jogo.'
  }

  return Object.keys(errors.value).length === 0
}

// Função de submit
function submitForm() {
  if (!validate()) return

  const novoEvento = {
    nome: nomeEvento.value,
    jogo: jogo.value
  }

  console.log('Evento criado:', novoEvento)
  alert('Evento criado com sucesso!')

  // Limpar formulário
  nomeEvento.value = ''
  jogo.value = ''
}
</script>

<template>
  <form @submit.prevent="submitForm" class="form-container">
    <!-- Nome do Evento -->
    <div class="form-group">
      <label for="nomeEvento">Nome do Evento:</label>
      <input
        id="nomeEvento"
        v-model="nomeEvento"
        type="text"
        placeholder="Digite o nome do evento"
      />
      <p v-if="errors.nomeEvento" class="error">{{ errors.nomeEvento }}</p>
    </div>

    <!-- Jogo -->
    <div class="form-group">
      <label for="jogo">Jogo:</label>
      <select id="jogo" v-model="jogo">
        <option disabled value="">Selecione um jogo</option>
        <option v-for="option in jogos" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <p v-if="errors.jogo" class="error">{{ errors.jogo }}</p>
    </div>

    <!-- Data -->
    <div class="form-group">
      <label for="dataEvento">Data do Evento:</label>
      <input id="dataEvento" v-model="dataEvento" type="date" />
      <p v-if="errors.dataEvento" class="error">{{ errors.dataEvento }}</p>
    </div>

    <!-- Hora -->
    <div class="form-group">
      <label for="horaEvento">Hora do Evento:</label>
      <input id="horaEvento" v-model="horaEvento" type="time" />
      <p v-if="errors.horaEvento" class="error">{{ errors.horaEvento }}</p>
    </div>

    <!-- Botão -->
    <button type="submit">Criar Evento</button>
  </form>
</template>

<style scoped>
.form-container {
  max-width: 400px;
  margin: auto;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 1rem;
}

.error {
  color: red;
  font-size: 0.9rem;
}
</style>
