<script setup lang="ts">
import { Compra } from '../services/interface'

const props = defineProps<{
  compras: Compra[]
  novaCompra: Compra
}>()

const emit = defineEmits<{
  (e: 'update:novaCompra', value: Compra): void
  (e: 'adicionar'): void
  (e: 'usarItem', index: number): void
}>()

const update = (field: keyof Compra, value: any) => {
  emit('update:novaCompra', { ...props.novaCompra, [field]: value })
}
</script>

<template>
  <v-card class="pa-4 adicionarTransacao">
    <h3>Gestão de Estoque</h3>
    <v-form @submit.prevent="emit('adicionar')">
      <v-text-field
        :model-value="novaCompra.nome"
        @update:model-value="update('nome', $event)"
        label="Nome do Item"
        required
      />
      <v-text-field
        :model-value="novaCompra.quantidade"
        @update:model-value="update('quantidade', Number($event))"
        label="Quantidade"
        type="number"
        required
      />
      <v-btn type="submit" color="primary" block class="mt-3">
        <v-icon start>mdi-cart-plus</v-icon> Adicionar Item
      </v-btn>
    </v-form>

    <v-row class="mt-4">
      <v-col v-for="(c, i) in compras" :key="i" cols="12" md="6">
        <v-card outlined>
          <v-card-title>
            {{ c.nome }}
            <v-spacer />
            <span :class="c.quantidade <= 1 ? 'text-red' : 'text-green'"
              >{{ c.quantidade }} unidade(s)</span
            >
          </v-card-title>
          <v-card-text>
            <v-btn
              small
              color="primary"
              @click="emit('usarItem', i)"
              :disabled="c.quantidade === 0"
            >
              Usar 1 unidade
            </v-btn>
            <span v-if="c.quantidade <= 1" class="text-red ml-2">⚠️ Estoque baixo!</span>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<style scoped>
.adicionarTransacao {
  background-color: #1a1d33;
  border-radius: 10px;
}
</style>
