<template>
  <div class="flex justify-content-center align-items-center p-3">
    <Card class="sm:w-full shadow-4">
      <template #title>
        <h2 class="text-center mb-4">Cadastrar</h2>
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

          <!-- NickName -->
          <div class="mb-3">
            <FloatLabel variant="on">
              <InputText
                fluid
                id="nickname"
                v-model="form.nickname"
                type="text"
                required
              />
              <label for="nickname">Nickname</label>
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
                :feedback="true"
                required
                @click.right.prevent
                @copy.prevent
                @paste.prevent
              />
              <label for="password">Senha</label>
            </FloatLabel>
          </div>

          <!-- Confirmar Senha -->
          <div class="mb-3">
            <FloatLabel variant="on">
              <Password
                fluid
                id="password2"
                v-model="form.password2"
                :invalid="form.password !== form.password2 && form.password2.length > 0"
                :feedback="false"
                required
                @click.right.prevent
                @copy.prevent
                @paste.prevent
              />
              <label for="password2">Confirmar Senha</label>
              <template v-if="form.password !== form.password2 && form.password2.length > 0">
                <Message severity="error" size="small" variant="simple">
                  Senhas não coincidem
                </Message>
              </template>
            </FloatLabel>
          </div>

          <!-- Botão -->
          <Button
            type="submit"
            :loading="loading"
            label="Criar Conta"
            icon="pi pi-sign-in"
            class="w-full mt-3"
          />
        </form>

        <div class="mt-4 flex items-center justify-center gap-2">
          <Message severity="secondary" size="small" variant="simple">
            Have an account?
          </Message>

          <Button
            severity="info"
            variant="text"
            size="small"
            asChild
            v-slot="slotProps"
          >
            <RouterLink to="/login" :class="slotProps.class">Login</RouterLink>
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
        nickname: "",        
        password: "",
        password2: "",
      },
      loading: false,
      errorMessage: "",
    };
  },
  methods: {
    async onFormeSubmit() {
      this.loading = true;
      this.errorMessage = "";

      if (this.form.password !== this.form.password2) {
        this.$toast.add({
          severity: "warn",
          summary: "Senhas não coincidem",
          detail: "Verifique se a senha e a confirmação estão iguais.",
          life: 3000,
        });
        this.loading = false;
        return;
      }

      const data = {
        email: this.form.email,
        name: this.form.nickname,
        password: this.form.password,
      };

      try {
        await api.post("/users/", data);
        this.$toast.add({
          severity: "success",
          summary: "Cadastro realizado!",
          detail: "Bem-vindo!",
          life: 3000,
        });

        this.$router.push("/");
      } catch (e) {
        this.$toast.add({
          severity: "error",
          summary: "Erro no cadastro",
          detail: e.response?.data?.message || "Ocorreu um erro ao tentar cadastrar.",
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
