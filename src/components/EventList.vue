<template>
  <div class="p-4 w-full">
    <h2 class="text-center mb-4">Eventos</h2>

    <div class="grid">
      <div
        v-for="event in events"
        :key="event._id"
        class="col-12 sm:col-6 md:col-4 lg:col-3"
      >
        <Card  class="h-full shadow-3 border-round-lg">
          <template  #title>
            <a class="link-hover" @click="goToEvent(event._id)">
              {{ event.name }}
            </a>
          </template>

          <template #subtitle>
            {{ event.gamemode }}
          </template>

          <template #content>
            <label
              class="flex align-items-center gap-2 mb-1"
              style="font-size: 0.8rem"
            >
              <i class="pi pi-calendar"></i>
              <span>{{ formatDate(event.dateTime) }}</span>
            </label>
            <label
              class="flex align-items-center gap-2 mb-1"
              style="font-size: 0.8rem"
            >
              <i class="pi pi-map-marker"></i>
              <span>{{ event.local ? event.local : "Não informado"}}</span>
            </label>
            <label
              class="flex align-items-center gap-2 mb-1"
              style="font-size: 0.8rem"
            >
              <i class="pi pi-users"></i>
              <span>{{event.qntPlayers ? event.qntPlayers : 0}} Players</span>
            </label>
          </template>

          <template #footer>
            <div class="grid w-full">
              <div class="col-6"></div>
              <div class="col-6">
                <Button
                :loading="loading"
                  size="small"
                  label="Registrar-se"
                  icon="pi pi-user-plus"
                  @click="joinEvent(event._id)"
                  class="w-full"
                  severity="success"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script>
import Card from "primevue/card";
import Button from "primevue/button";
import api from "@/api";

export default {
  components: { Card, Button },
  data() {
    return {
      events: [],
      loading: false,
    };
  },
  async mounted() {
    try {
      const response = await api.get("/events");
      this.events = response.data;
    } catch (err) {
      console.error("Erro ao carregar eventos", err);
      this.$toast.add({
        severity: "error",
        summary: "Erro",
        detail: "Não foi possível carregar os eventos.",
        life: 3000,
      });
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
    goToEvent(id) {
      this.$router.push(`/events/${id}`);
    },
    async joinEvent(id) {
      try {
        await api.post("/events/" + id);
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
          summary: "Erro ao se registrar",
          detail: "Erro ao se registrar. Tente novamente mais tarde.",
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

<style scoped>
  .link-hover {
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.link-hover:hover {
  color: #555; /* escurece no hover */
}
</style>