<template>
  <div class="p-4">
    <h2 class="text-center mb-4">Eventos</h2>

    <div class="grid">
      <div v-for="event in events" :key="event.id" class="col-12 md:col-4">
        <Card class="shadow-4 border-round-lg">
          <template #title>
            {{ event.title }}
          </template>

          <template #subtitle>
            {{ formatDate(event.date) }} — {{ event.location }}
          </template>

          <template #content>
            <p class="m-0">{{ event.description }}</p>
          </template>

          <template #footer>
            <Button
              label="Ver Detalhes"
              icon="pi pi-eye"
              @click="goToEvent(event.id)"
              class="w-full"
            />
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
  },
};
</script>

<style scoped>
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}
</style>
