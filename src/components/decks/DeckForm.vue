<template>
  <div class="flex justify-content-center align-items-center">
    <Card class="sm:w-full m-auto shadow-4">
      <template #title>
        <h2 class="text-center mb-4">
          {{ isEditMode ? "Editar Deck" : "Criar Deck" }}
        </h2>
      </template>

      <template #content>
        <form @submit.prevent="onFormSubmit">
          <!-- Nome -->
          <div class="mb-3">
            <FloatLabel variant="on">
              <InputText :maxlength="30" fluid id="name" v-model="form.name" required />
              <label for="name">Nome do Deck</label>
            </FloatLabel>
            <Message
              v-if="errors.name"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ errors.name }}
            </Message>
          </div>

          <!-- Comandante -->
          <div class="mb-3">
            <FloatLabel variant="on">
              <InputText :maxlength="40" fluid id="commander" v-model="form.commander" />
              <label for="commander">Comandante (Opcional)</label>
            </FloatLabel>
            <Message
              v-if="errors.commander"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ errors.commander }}
            </Message>
          </div>

          <!-- Link -->
          <div class="mb-3">
            <FloatLabel variant="on">
              <InputText :maxlength="60" fluid id="link" v-model="form.link" required />
              <label for="link">Link do Deck</label>
            </FloatLabel>
            <Message
              v-if="errors.link"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ errors.link }}
            </Message>
          </div>

          <!-- Botões -->
          <div class="grid mt-3">
            <div class="col-12 md:col-6">
              <Button
                type="submit"
                :loading="loading"
                :label="isEditMode ? 'Salvar Alterações' : 'Criar Deck'"
                class="w-full"
              />
            </div>

            <div class="col-6 md:col-3">
              <Button
                type="button"
                label="Voltar"
                :loading="loading"
                severity="warn"
                icon="pi pi-arrow-left"
                class="w-full"
                :disabled="!isEditMode"
                @click="back"
              />
            </div>

            <div class="col-6 md:col-3">
              <Button
                type="button"
                label="Deletar"
                :loading="loading"
                severity="danger"
                icon="pi pi-trash"
                class="w-full"
                :disabled="!isEditMode"
                @click="onDelete"
              />
            </div>
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script>
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import FloatLabel from "primevue/floatlabel";
import Message from "primevue/message";
import api from "@/api";

export default {
  components: { Card, InputText, Button, FloatLabel, Message },
  data() {
    return {
      form: { name: "", commander: "", link: "" },
      errors: { name: "", commander: "", link: "" },
      loading: false,
    };
  },
  computed: {
    isEditMode() {
      return !!this.$route.params.id;
    },
  },
  async mounted() {
    if (this.isEditMode) {
      this.loading = true;
      try {
        const { data: deck } = await api.get(`/decks/${this.$route.params.id}`);
        this.form = {
          name: deck.name,
          commander: deck.commander || "",
          link: deck.link,
        };
      } catch (err) {
        console.error("Erro ao carregar deck", err);
        this.$toast.add({
          severity: "error",
          summary: "Erro",
          detail: "Não foi possível carregar os dados do deck.",
          life: 3000,
        });
      } finally {
        this.loading = false;
      }
    }
  },
  methods: {
    validateField(field) {
      const value = this.form[field];
      this.errors[field] = "";

      switch (field) {
        case "name":
          if (!value) this.errors.name = "O nome é obrigatório.";
          else if (value.length > 30)
            this.errors.name = "Máximo de 30 caracteres.";
          break;
        case "commander":
          if (value && value.length > 40)
            this.errors.commander = "Máximo de 40 caracteres.";
          break;
        case "link":
          if (!value) this.errors.link = "O link é obrigatório.";
          else if (value.length > 60)
            this.errors.link = "Máximo de 60 caracteres.";
          else if (
            !value.startsWith("https://www.ligamagic.com.br/?view=dks/deck&id") &&
            !value.startsWith("https://moxfield.com/decks/")
          )
            this.errors.link = "O link deve ser do LigaMagic ou do Moxfield.";
          break;
      }
    },
    validateAll() {
      Object.keys(this.form).forEach((f) => this.validateField(f));
      return !Object.values(this.errors).some((e) => e);
    },
    isValidLink(link) {
      return (
        link.startsWith("https://www.ligamagic.com.br/?view=dks/deck&id") ||
        link.startsWith("https://moxfield.com/decks/")
      );
    },
    async onFormSubmit() {
      if (!this.validateAll()) return;
      this.loading = true;

      try {
        if (!this.isValidLink(this.form.link)) {
          this.$toast.add({
            severity: "warn",
            summary: "Link inválido",
            detail:
              "O link deve ser do LigaMagic ou Moxfield (ex: moxfield.com/decks/...).",
            life: 4000,
          });
          this.loading = false;
          return;
        }

        const payload = { ...this.form, commander: this.form.commander || null };

        if (this.isEditMode) {
          await api.put(`/decks/${this.$route.params.id}`, payload);
          this.$toast.add({
            severity: "success",
            summary: "Deck atualizado!",
            detail: "O deck foi atualizado com sucesso!",
            life: 3000,
          });
        } else {
          await api.post("/decks/user", payload);
          this.$toast.add({
            severity: "success",
            summary: "Deck criado!",
            detail: "Seu deck foi criado com sucesso!",
            life: 3000,
          });
        }

        this.$router.push("#/decks");
      } catch (err) {
        console.error("Erro ao salvar deck", err);
        this.$toast.add({
          severity: "error",
          summary: "Erro",
          detail: "Não foi possível salvar o deck.",
          life: 3000,
        });
      } finally {
        this.loading = false;
      }
    },
    back() {
      this.$router.push("#/decks");
    },
    async onDelete() {
      if (!confirm("Tem certeza que deseja deletar este deck?")) return;

      this.loading = true;
      try {
        await api.delete(`/decks/${this.$route.params.id}`);
        this.$toast.add({
          severity: "success",
          summary: "Deck deletado",
          detail: "O deck foi removido com sucesso.",
          life: 3000,
        });
        this.$router.push("#/decks");
      } catch (err) {
        console.error("Erro ao deletar deck", err);
        this.$toast.add({
          severity: "error",
          summary: "Erro",
          detail: "Não foi possível deletar o deck.",
          life: 3000,
        });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
