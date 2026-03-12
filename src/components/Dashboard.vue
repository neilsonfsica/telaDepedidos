<script setup lang="ts">
import { formatCurrency } from '../geral'

defineProps<{
  receita: number
  despesa: number
  saldo: number
}>()
</script>

<template>
  <v-row>
    <v-col cols="12" md="4">
      <v-card class="dashboard-card">
        <div class="barra green"></div>
        <v-card-title><v-icon class="mr-2">mdi-cash</v-icon>Receitas</v-card-title>
        <v-card-text class="text-h5">R$ {{ formatCurrency(receita) }}</v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="4">
      <v-card class="dashboard-card">
        <div class="barra red"></div>
        <v-card-title><v-icon class="mr-2">mdi-cart</v-icon>Despesas</v-card-title>
        <v-card-text class="text-h5">R$ {{ formatCurrency(despesa) }}</v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="4">
      <v-card class="dashboard-card">
        <div class="barra" :class="saldo >= 0 ? 'blue' : 'orange'"></div>
        <v-card-title><v-icon class="mr-2">mdi-wallet</v-icon>Saldo</v-card-title>
        <v-card-text class="text-h5">R$ {{ formatCurrency(saldo) }}</v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-row class="mt-6">
    <v-col cols="12" md="6">
      <v-card class="pa-4 graficos">
        <h3 class="mb-4">Receitas x Despesas</h3>
        <div class="chart-container">
          <canvas id="grafico"></canvas>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card class="pa-4 graficos">
        <h3 class="mb-4">Despesas por Categoria</h3>
        <div class="chart-container">
          <canvas id="graficoCategoria"></canvas>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.graficos {
  background-color: #1a1d33;
  min-height: 25rem;
}
.barra {
  position: absolute;
  left: 0;
  top: 0;
  width: 5px;
  height: 100%;
  z-index: 1;
}
.barra.green {
  background-color: #00e676;
}
.barra.red {
  background-color: #ff1744;
}
.barra.blue {
  background-color: rgb(var(--v-theme-primary));
}
.barra.orange {
  background-color: rgb(var(--v-theme-warning));
}
.v-card.dashboard-card {
  position: relative;
  padding-left: 12px;
  overflow: hidden;
  border-radius: 10px;
  background-color: #1a1d33;
}
</style>
