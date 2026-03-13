<script setup lang="ts">
import { computed } from 'vue'
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

const isReceita = computed(() => props.novaTransacao.tipo === 'Receita')

const corTipo = computed(() => (isReceita.value ? '#4ade80' : '#f87171'))

const iconeTipo = computed(() => (isReceita.value ? 'mdi-trending-up' : 'mdi-trending-down'))

const categoriaIcones: Record<string, string> = {
  Alimentação: 'mdi-food',
  Transporte: 'mdi-car',
  Lazer: 'mdi-gamepad-variant',
  Saúde: 'mdi-pill',
  Internet: 'mdi-web',
  Água: 'mdi-water',
  Luz: 'mdi-lightbulb',
  Salário: 'mdi-cash-multiple',
  Investimentos: 'mdi-chart-line',
  Outros: 'mdi-dots-horizontal',
}
</script>

<template>
  <div class="form-wrapper">
    <div class="form-header mb-6">
      <div class="header-icon" :style="`background: ${corTipo}18; border-color: ${corTipo}33`">
        <v-icon :color="corTipo" size="28">{{ iconeTipo }}</v-icon>
      </div>
      <div>
        <div class="header-eyebrow">Finanças</div>
        <h2 class="header-title">Nova Transação</h2>
      </div>
    </div>

    <v-form @submit.prevent="emit('salvar')">
      <v-row>
        <v-col cols="12" md="6">
          <div class="field-group mb-5">
            <div class="field-label">Tipo de transação</div>
            <div class="tipo-toggle">
              <button
                v-for="tipo in escolherTipo"
                :key="tipo"
                type="button"
                class="tipo-btn"
                :class="{
                  'tipo-btn--receita': tipo === 'Receita' && novaTransacao.tipo === tipo,
                  'tipo-btn--despesa': tipo === 'Despesa' && novaTransacao.tipo === tipo,
                  'tipo-btn--inactive': novaTransacao.tipo !== tipo,
                }"
                @click="update('tipo', tipo)"
              >
                <v-icon size="16" class="mr-1">
                  {{ tipo === 'Receita' ? 'mdi-trending-up' : 'mdi-trending-down' }}
                </v-icon>
                {{ tipo }}
              </button>
            </div>
          </div>
          <div class="field-group mb-5">
            <div class="field-label">Valor</div>
            <div class="valor-input-wrap" :style="`border-color: ${corTipo}44`">
              <span class="valor-prefix" :style="`color: ${corTipo}`">R$</span>
              <input
                class="valor-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                :value="novaTransacao.valor || ''"
                @input="update('valor', Number(($event.target as HTMLInputElement).value))"
              />
            </div>
          </div>

          <div class="field-group mb-5">
            <div class="field-label">Data</div>
            <v-text-field
              :model-value="novaTransacao.data"
              @update:model-value="update('data', $event)"
              type="date"
              variant="outlined"
              density="comfortable"
              hide-details
              class="dark-field"
              :style="`--field-color: ${corTipo}`"
            />
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="field-group mb-5">
            <div class="field-label">Categoria</div>
            <div class="categoria-grid">
              <button
                v-for="cat in categoriaFiltro"
                :key="cat"
                type="button"
                class="cat-btn"
                :class="{ 'cat-btn--active': novaTransacao.categoria === cat }"
                :style="
                  novaTransacao.categoria === cat
                    ? `border-color: ${corTipo}; background: ${corTipo}12; color: ${corTipo}`
                    : ''
                "
                @click="update('categoria', cat)"
              >
                <v-icon size="14" class="mr-1">{{ categoriaIcones[cat] || 'mdi-tag' }}</v-icon>
                {{ cat }}
              </button>
            </div>
          </div>

          <div class="field-group mb-5">
            <div class="field-label">Descrição <span style="opacity: 0.4">(opcional)</span></div>
            <v-textarea
              :model-value="novaTransacao.descricao"
              @update:model-value="update('descricao', $event)"
              placeholder="Ex: Compra no mercado..."
              variant="outlined"
              density="comfortable"
              rows="3"
              no-resize
              hide-details
              class="dark-field"
            />
          </div>
        </v-col>
      </v-row>

      <div class="mt-2">
        <button
          type="submit"
          class="salvar-btn"
          :style="`background: linear-gradient(135deg, ${corTipo}cc, ${corTipo}99)`"
        >
          <v-icon size="18" class="mr-2">mdi-check-circle</v-icon>
          Salvar {{ novaTransacao.tipo || 'Transação' }}
        </button>
      </div>
    </v-form>
  </div>
</template>

<style scoped>
.form-wrapper {
  max-width: 860px;
  margin: 0 auto;
  padding: 8px 0 32px;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.header-eyebrow {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 2px;
}

.header-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.03em;
  line-height: 1;
}

.field-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 8px;
}

.tipo-toggle {
  display: flex;
  gap: 8px;
}

.tipo-btn {
  flex: 1;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-family: inherit;
}

.tipo-btn--receita {
  background: rgba(74, 222, 128, 0.1);
  border-color: rgba(74, 222, 128, 0.4);
  color: #4ade80;
}

.tipo-btn--despesa {
  background: rgba(248, 113, 113, 0.1);
  border-color: rgba(248, 113, 113, 0.4);
  color: #f87171;
}

.tipo-btn--inactive:hover {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
}

.valor-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0 16px;
  height: 52px;
  transition: border-color 0.2s;
}

.valor-input-wrap:focus-within {
  border-color: v-bind(corTipo) !important;
  background: rgba(255, 255, 255, 0.06);
}

.valor-prefix {
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
  transition: color 0.3s;
}

.valor-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  font-family: inherit;
}

.valor-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.valor-input::-webkit-inner-spin-button,
.valor-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

/* ── Categoria grid ── */
.categoria-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cat-btn {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  font-family: inherit;
  white-space: nowrap;
}

.cat-btn:hover {
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.7);
}

.dark-field :deep(.v-field) {
  background: rgba(255, 255, 255, 0.04) !important;
  border-radius: 10px !important;
}

.dark-field :deep(.v-field__outline__start),
.dark-field :deep(.v-field__outline__end),
.dark-field :deep(.v-field__outline__notch) {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.dark-field :deep(.v-field--focused .v-field__outline__start),
.dark-field :deep(.v-field--focused .v-field__outline__end),
.dark-field :deep(.v-field--focused .v-field__outline__notch) {
  border-color: rgba(255, 255, 255, 0.3) !important;
}

.dark-field :deep(.v-field__input) {
  color: #fff !important;
}

.dark-field :deep(.v-label) {
  color: rgba(255, 255, 255, 0.35) !important;
}

.salvar-btn {
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  color: #0a0e27;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  font-family: inherit;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

.salvar-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  filter: brightness(1.1);
}

.salvar-btn:active {
  transform: translateY(0);
}
</style>
