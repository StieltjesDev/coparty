<template>
  <div class="auth-shell">
    <Card class="auth-card">
      <template #title>
        <h2 class="text-center mb-4 page-title">Criar conta</h2>
      </template>

      <template #content>
        <div class="app-highlight app-highlight--accent mb-4">
          <div>
            <span class="app-highlight-label">Cadastro</span>
            <strong class="app-highlight-title">Crie sua conta para liberar decks e eventos</strong>
          </div>
        </div>

        <form class="flex flex-column gap-3" @submit.prevent="onSubmit">
          <div>
            <FloatLabel variant="on">
              <InputText id="username" v-model="form.username" fluid />
              <label for="username">Usuario</label>
            </FloatLabel>
          </div>

          <div>
            <FloatLabel variant="on">
              <InputText id="email" v-model="form.email" type="email" fluid />
              <label for="email">E-mail</label>
            </FloatLabel>
          </div>

          <div>
            <FloatLabel variant="on">
              <Password id="password" v-model="form.password" fluid toggleMask :feedback="true" />
              <label for="password">Senha</label>
            </FloatLabel>
          </div>

          <div>
            <FloatLabel variant="on">
              <Password id="passwordConfirm" v-model="form.passwordConfirm" fluid toggleMask :feedback="false" />
              <label for="passwordConfirm">Confirmar senha</label>
            </FloatLabel>
          </div>

          <Button type="submit" label="Cadastrar" icon="pi pi-user-plus" :loading="loading" class="w-full" />
        </form>

        <div class="mt-4 flex justify-content-center gap-2 auth-helper">
          <span>Ja tem conta?</span>
          <RouterLink to="/login">Entrar</RouterLink>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import { useToast } from 'primevue/usetoast'
import { login, signup } from '@/services/auth'
import { getErrorMessage } from '@/services/error'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'

const auth = useAuthStore()
const playerStore = usePlayerStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const loading = ref(false)
const form = reactive({
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
})

async function onSubmit() {
  if (!form.email.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'E-mail obrigatorio',
      detail: 'Informe um e-mail valido para criar sua conta.',
      life: 3000,
    })
    return
  }

  if (form.password !== form.passwordConfirm) {
    toast.add({
      severity: 'warn',
      summary: 'Senha divergente',
      detail: 'A confirmacao precisa ser igual a senha.',
      life: 3000,
    })
    return
  }

  loading.value = true

  try {
    await signup({
      username: form.username,
      email: form.email.trim(),
      password: form.password,
    })
    await login({ login: form.username, password: form.password })
    await auth.fetchSession(true)
    await playerStore.fetchMyPlayer(true)

    toast.add({
      severity: 'success',
      summary: 'Conta criada',
      detail: 'Sua conta e seu player foram criados com sucesso.',
      life: 3000,
    })

    await router.push(route.query.redirect || '/events')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Falha no cadastro',
      detail: getErrorMessage(error, 'Nao foi possivel criar a conta.'),
      life: 4000,
    })
  } finally {
    loading.value = false
  }
}
</script>
