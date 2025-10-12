<template>
  <div class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2>Meus Decks</h2>
      <Button label="Novo Deck" icon="pi pi-plus" @click="goToCreateDeck" />
    </div>

    <DataTable
      :value="decks"
      paginator
      :rows="5"
      dataKey="_id"
      :globalFilterFields="['name', 'format']"
      v-model:filters="filters"
      class="w-full shadow-2 border-round"
    >
      <template #header>
        <div class="flex justify-content-end">
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText
              v-model="filters.global.value"
              placeholder="Buscar deck..."
            />
          </span>
        </div>
      </template>

      <Column field="name" header="Nome" sortable></Column>
      <Column field="commander" header="Comandante"></Column>
      <Column field="createdAt" header="Criado em">
        <template #body="{ data }">
          {{ formatDate(data.createdAt) }}
        </template>
      </Column>

      <Column header="Ações" bodyClass="text-center" style="width: 150px">
        <template #body="{ data }">
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-info mr-2"
            @click="editDeck(data._id)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-danger"
            @click="deleteDeck(data._id)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";

export default {
  components: { Button, DataTable, Column, InputText },
  setup() {
    const decks = ref([]);
    const filters = ref({
      global: { value: null, matchMode: "contains" },
    });

    const router = useRouter();

    const loadDecks = async () => {
      try {
        const response = await api.get("/decks");
        decks.value = response.data;
      } catch (err) {
        console.error("Erro ao carregar decks:", err);
      }
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const goToCreateDeck = () => {
      router.push("/decks/create");
    };

    const editDeck = (id) => {
      router.push(`/decks/edit/${id}`);
    };

    const deleteDeck = async (id) => {
      if (confirm("Tem certeza que deseja excluir este deck?")) {
        try {
          await api.delete(`/decks/${id}`);
          loadDecks();
        } catch (err) {
          console.error("Erro ao excluir deck:", err);
        }
      }
    };

    onMounted(loadDecks);

    return {
      decks,
      filters,
      formatDate,
      goToCreateDeck,
      editDeck,
      deleteDeck,
    };
  },
};
</script>

<style scoped>
.p-input-icon-left i {
  margin-right: 0.5rem;
}
</style>
