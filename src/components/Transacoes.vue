<script setup lang="ts">
import { formatCurrency } from '../geral'
import { Transacao } from '../services/interface'
import { Icon } from '@iconify/vue'

defineProps<{
  transacoes: Transacao[]
  iconesCategoria: Record<string, string>
}>()
</script>

<template>
  <v-row v-if="transacoes.length === 0">
    <v-col cols="12">
      <v-alert type="info">Nenhuma transação registrada</v-alert>
    </v-col>
  </v-row>

  <v-row v-else>
    <v-col v-for="(t, i) in transacoes" :key="i" cols="12" md="4">
      <v-card flat class="transaction-card pa-4" max-width="450">
        <div class="d-flex align-center mb-6">
          <v-avatar
            :class="t.tipo === 'Receita' ? 'avatar-receita' : 'avatar-despesa'"
            size="56"
            rounded="lg"
            class="mr-4"
          >
            <Icon
              :icon="iconesCategoria[t.categoria] || 'fluent-emoji:money-with-wings'"
              width="32"
            />
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold mb-n1 text-white">
              {{ t.tipo }} - {{ t.categoria }}
            </div>
            <div class="text-body-2 text-subtitle">{{ t.tipo }}</div>
          </div>
        </div>

        <div
          class="text-h4 font-weight-bold mb-4"
          :class="t.tipo === 'Receita' ? 'valor-receita' : 'valor-despesa'"
        >
          R$ {{ formatCurrency(t.valor) }}
        </div>

        <v-divider class="mb-4 divider-opaco"></v-divider>

        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center text-body-2 text-subtitle">
            <v-icon size="18" class="mr-2">mdi-calendar-range</v-icon>
            {{ t.data }}
          </div>
          <v-sheet class="description-tag px-4 py-2" max-width="200">
            <span class="text-truncate d-inline-block w-100">{{
              t.descricao || 'Sem descrição'
            }}</span>
          </v-sheet>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.v-card.transaction-card {
  background-color: #1a1d33;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  transition: transform 0.2s ease;
}
.v-card.transaction-card:hover {
  transform: translateY(-4px);
  background-color: #20243d;
}
.valor-receita {
  color: #0bf36c;
}
.valor-despesa {
  color: #fd0000;
}
.avatar-despesa {
  background-color: #3e2a3b;
}
.avatar-receita {
  background-color: #1e3a34;
}
.text-subtitle {
  color: #9499b3;
}
.divider-opaco {
  border-color: rgba(255, 255, 255, 0.08);
}
.description-tag {
  background-color: rgba(36, 40, 68, 0.8);
  color: #9499b3;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}
</style>
