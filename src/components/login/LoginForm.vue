<template>
  <div class="auth-shell">
    <Card class="auth-card">
      <template #title>
        <h2 class="text-center mb-4 page-title">Entrar</h2>
      </template>

      <template #content>
        <form class="flex flex-column gap-3" @submit.prevent="onSubmit">
          <div>
            <FloatLabel variant="on">
              <InputText id="login" v-model="form.login" fluid />
              <label for="login">Usuario ou e-mail</label>
            </FloatLabel>
          </div>

          <div>
            <FloatLabel variant="on">
              <Password id="password" v-model="form.password" fluid toggleMask :feedback="false" />
              <label for="password">Senha</label>
            </FloatLabel>
          </div>

          <Button type="submit" label="Entrar" icon="pi pi-sign-in" :loading="loading" class="w-full" />
        </form>

        <div class="mt-4 flex justify-content-center gap-2 auth-helper">
          <span>Primeira vez aqui?</span>
          <RouterLink to="/signup">Criar conta</RouterLink>
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
import { login } from '@/services/auth'
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
  login: '',
  password: '',
})

async function onSubmit() {
  loading.value = true

  try {
    await login({ login: form.login, password: form.password })
    await auth.fetchSession(true)
    await playerStore.fetchMyPlayer(true).catch(() => null)

    toast.add({
      severity: 'success',
      summary: 'Sessao iniciada',
      detail: 'Bem-vindo ao Coparty.',
      life: 2500,
    })

    await router.push(route.query.redirect || '/events')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Falha no login',
      detail: getErrorMessage(error, 'Nao foi possivel autenticar.'),
      life: 4000,
    })
  } finally {
    loading.value = false
  }
}
</script>
