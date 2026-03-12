<script setup lang="ts">
const props = defineProps<{
  abaSelecionada: string
}>()

const emit = defineEmits<{
  (e: 'update:abaSelecionada', value: string): void
}>()
</script>

<template>
  <v-app-bar flat height="70" class="app-bar-custom px-4">
    <v-row justify="center" align="center" class="w-100">
      <v-tabs
        :model-value="abaSelecionada"
        @update:model-value="emit('update:abaSelecionada', $event as string)"
        color="primary"
        align-tabs="center"
        hide-slider
        class="custom-tabs-container"
      >
        <v-tab value="dashboard" class="custom-tab">
          <v-icon start size="22">mdi-finance</v-icon>
          Dashboard
        </v-tab>
        <v-tab value="adicionar" class="custom-tab">
          <v-icon start size="22">mdi-plus-circle</v-icon>
          Adicionar
        </v-tab>
        <v-tab value="transacoes" class="custom-tab">
          <v-icon start size="22">mdi-swap-vertical</v-icon>
          Transações
        </v-tab>
        <v-tab value="compras" class="custom-tab">
          <v-icon start size="22">mdi-cart</v-icon>
          Estoque
        </v-tab>
        <v-tab value="vencimentos" class="custom-tab">
          <v-icon start size="22">mdi-receipt-text</v-icon>
          Vencimentos
        </v-tab>
      </v-tabs>
    </v-row>
  </v-app-bar>
</template>

<style>
.v-toolbar.app-bar-custom {
  background: rgba(10, 14, 39, 0.7) !important;
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
</style>
