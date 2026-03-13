<script setup lang="ts">
import { Transacao } from '../services/interface'

const props = defineProps<{
  novaTransacao: Transacao
  escolherTipo: string[]
  categoriaFiltro: string[]
}>()

const emit = defineEmits<{
  (e: 'update:novaTransacao', value: Transacao): void
  (e: 'salvar'): void
}>()

const update = (field: keyof Transacao, value: any) => {
  emit('update:novaTransacao', { ...props.novaTransacao, [field]: value })
}
</script>

<template>
  <v-card class="pa-4 adicionarTransacao">
    <h3>Nova Transação</h3>
    <v-form @submit.prevent="emit('salvar')">
      <v-select
        :model-value="novaTransacao.tipo"
        @update:model-value="update('tipo', $event)"
        :items="escolherTipo"
        label="Tipo"
        required
      />
      <v-text-field
        :model-value="novaTransacao.valor"
        @update:model-value="update('valor', Number($event))"
        label="Valor (R$)"
        type="number"
        required
      />
      <v-select
        :model-value="novaTransacao.categoria"
        @update:model-value="update('categoria', $event)"
        :items="categoriaFiltro"
        label="Categoria"
        required
      />
      <v-textarea
        :model-value="novaTransacao.descricao"
        @update:model-value="update('descricao', $event)"
        label="Descrição"
        auto-grow
      />
      <v-btn type="submit" color="primary" block class="mt-3">
        <v-icon start>mdi-check</v-icon> Salvar
      </v-btn>
    </v-form>
  </v-card>
</template>

<style scoped>
.adicionarTransacao {
  background-color: #1a1d33;
  border-radius: 10px;
}
</style>
