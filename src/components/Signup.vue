<template>
  <div class="flex justify-content-center align-items-center">
    <div class="card p-4 shadow-8 border-round-lg">
      <h2 class="text-center mb-4">Cadastrar</h2>

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
              :feedback="true"
              required
              @click.right.prevent
              @copy.prevent
              @paste.prevent
            />
            <label for="password">Senha</label>
          </FloatLabel>
        </div>

        <!-- Senha -->
        <div class="mb-3">
          <FloatLabel variant="on">
            <Password
              fluid
              id="password2"
              v-model="form.password2"
              :invalid="
                form.password !== form.password2 && form.password2.length > 0
              "
              :feedback="false"
              required
              @click.right.prevent
              @copy.prevent
              @paste.prevent
            />
            <template
              v-if="
                form.password !== form.password2 && form.password2.length > 0
              "
            >
              <Message severity="error" size="small" variant="simple">
                Senhas não coincidem
              </Message>
            </template>

            <label for="password2">Confirmar Senha</label>
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
          Have a account?
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
    </div>
  </div>
</template>


<script>
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import FloatLabel from "primevue/floatlabel";
import Message from "primevue/message";

export default {
  components: { InputText, Password, Button, FloatLabel, Message },
  data() {
    return {
      form: {
        email: "",
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
      const data = {
        email: this.form.email,
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

        // redireciona (caso use vue-router)
        this.$router.push("/");
      } catch (e) {
        this.$toast.add({
          severity: "error",
          summary: "Erro no cadastro",
          detail: "Erro ao fazer cadastro. Tente novamente mais tarde.",
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
