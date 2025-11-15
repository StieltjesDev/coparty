<template>
  <div class="flex justify-content-center align-items-center p-3">
    <Card class="sm:w-full shadow-4">
      <template #title>
        <h2 class="text-center mb-4">Login</h2>
      </template>

      <template #content>
        <form @submit.prevent="onFormeSubmit">
          <!-- E-mail -->
          <div class="mb-3">
            <FloatLabel variant="on">
              <InputText
                fluid
                id="email"
                v-model="form.email"
                type="email"
                required
              />
              <label for="email">E-mail</label>
            </FloatLabel>
          </div>

          <!-- Senha -->
          <div class="mb-3">
            <FloatLabel variant="on">
              <Password
                fluid
                id="password"
                v-model="form.password"
                toggleMask
                :feedback="false"
                required
              />
              <label for="password">Senha</label>
            </FloatLabel>
          </div>

          <!-- Botão -->
          <Button
            type="submit"
            :loading="loading"
            label="Entrar"
            icon="pi pi-sign-in"
            class="w-full mt-3"
          />
        </form>

        <div class="mt-4 flex items-center justify-center gap-2">
          <Message severity="secondary" size="small" variant="simple">
            First time?
          </Message>

          <Button
            severity="info"
            variant="text"
            size="small"
            asChild
            v-slot="slotProps"
          >
            <RouterLink to="/signup" :class="slotProps.class">Signup</RouterLink>
          </Button>
        </div>
      </template>
    </Card>
  </div>
</template>

<script>
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import FloatLabel from "primevue/floatlabel";
import Message from "primevue/message";
import api from "@/api";

export default {
  components: { Card, InputText, Password, Button, FloatLabel, Message },
  data() {
    return {
      form: {
        email: "",
        password: "",
      },
      loading: false,
      errorMessage: "",
    };
  },
  methods: {
    async onFormeSubmit() {
      this.loading = true;
      this.errorMessage = "";

      try {
        await api.post("/users/login", this.form);
        this.$toast.add({
          severity: "success",
          summary: "Login realizado!",
          detail: "Bem-vindo de volta!",
          life: 3000,
        });

        this.$router.push("/");
      } catch (e) {
        this.$toast.add({
          severity: "error",
          summary: "Erro no login",
          detail: "Erro ao fazer login. Verifique suas credenciais.",
          life: 3000,
        });
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
