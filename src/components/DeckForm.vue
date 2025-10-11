<template>
  <div class="flex justify-content-center align-items-center">
    <div class="card p-4 shadow-8 border-round-lg w-30rem m-auto">
      <h2 class="text-center mb-4">
        {{ isEditMode ? "Editar Deck" : "Criar Deck" }}
      </h2>

      <form @submit.prevent="onFormSubmit">
        <!-- Nome -->
        <div class="mb-3">
          <FloatLabel variant="on">
            <InputText fluid id="name" v-model="form.name" required />
            <label for="name">Nome do Deck</label>
          </FloatLabel>
        </div>

        <!-- Comandante -->
        <div class="mb-3">
          <FloatLabel variant="on">
            <InputText fluid id="commander" v-model="form.commander" />
            <label for="commander">Comandante (Opcional)</label>
          </FloatLabel>
        </div>

        <!-- Link -->
        <div class="mb-3">
          <FloatLabel variant="on">
            <InputText fluid id="link" v-model="form.link" required />
            <label for="link">Link do Deck</label>
          </FloatLabel>
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

          <div class="col-12 md:col-6">
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
    </div>
  </div>
</template>

<script>
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import FloatLabel from "primevue/floatlabel";
import api from "@/api";

export default {
  components: { InputText, Button, FloatLabel },
  data() {
    return {
      form: {
        name: "",
        commander: "",
        link: "",
      },
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
        const response = await api.get(`/decks/${this.$route.params.id}`);
        const deck = response.data;
        this.form.name = deck.name;
        this.form.commander = deck.commander || "";
        this.form.link = deck.link;
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
    isValidLink(link) {
      return (
        link.startsWith(
          "https://www.ligamagic.com.br/?view=dks/deck&id"
        ) || link.startsWith("https://moxfield.com/decks/")
      );
    },
    async onFormSubmit() {
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

        const data = {
          name: this.form.name,
          commander: this.form.commander || null,
          link: this.form.link,
        };

        if (this.isEditMode) {
          await api.put(`/decks/${this.$route.params.id}`, data);
          this.$toast.add({
            severity: "success",
            summary: "Deck atualizado!",
            detail: "O deck foi atualizado com sucesso!",
            life: 3000,
          });
        } else {
          await api.post("/decks/user", data);
          this.$toast.add({
            severity: "success",
            summary: "Deck criado!",
            detail: "Seu deck foi criado com sucesso!",
            life: 3000,
          });
        }

        this.$router.push("/decks");
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
    async onDelete() {
      const confirmDelete = confirm(
        "Tem certeza que deseja deletar este deck?"
      );
      if (!confirmDelete) return;

      this.loading = true;
      try {
        await api.delete(`/decks/${this.$route.params.id}`);
        this.$toast.add({
          severity: "success",
          summary: "Deck deletado",
          detail: "O deck foi removido com sucesso.",
          life: 3000,
        });
        this.$router.push("/decks");
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
