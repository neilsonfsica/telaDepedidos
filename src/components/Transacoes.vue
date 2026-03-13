<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatCurrency, formatarData } from '../geral'
import { Transacao } from '../services/interface'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  transacoes: Transacao[]
  iconesCategoria: Record<string, string>
}>()

const filtro = ref<'todos' | 'Receita' | 'Despesa'>('todos')
const busca = ref('')

const totalReceitas = computed(() =>
  props.transacoes.filter((t) => t.tipo === 'Receita').reduce((s, t) => s + Number(t.valor), 0),
)
const totalDespesas = computed(() =>
  props.transacoes.filter((t) => t.tipo === 'Despesa').reduce((s, t) => s + Number(t.valor), 0),
)
const saldo = computed(() => totalReceitas.value - totalDespesas.value)
const qtdReceitas = computed(() => props.transacoes.filter((t) => t.tipo === 'Receita').length)
const qtdDespesas = computed(() => props.transacoes.filter((t) => t.tipo === 'Despesa').length)

const transacoesFiltradas = computed(() =>
  props.transacoes.filter((t) => {
    const matchTipo = filtro.value === 'todos' || t.tipo === filtro.value
    const matchBusca =
      !busca.value ||
      t.categoria.toLowerCase().includes(busca.value.toLowerCase()) ||
      (t.descricao || '').toLowerCase().includes(busca.value.toLowerCase())
    return matchTipo && matchBusca
  }),
)
</script>

<template>
  <div class="tx-page">
    <div class="tx-header">
      <div>
        <div class="eyebrow">Histórico financeiro</div>
        <h1 class="page-title">Transações</h1>
      </div>
      <div class="header-badge">{{ transacoes.length }} registros</div>
    </div>

    <v-row class="mb-5" dense>
      <v-col cols="12" md="4">
        <div class="stat-card stat-card--green">
          <div class="stat-label">Receitas</div>
          <div class="stat-value" style="color: #4ade80">
            R$ {{ formatCurrency(totalReceitas) }}
          </div>
          <div class="stat-sub">
            ↑ {{ qtdReceitas }} {{ qtdReceitas === 1 ? 'entrada' : 'entradas' }}
          </div>
        </div>
      </v-col>
      <v-col cols="12" md="4">
        <div class="stat-card stat-card--red">
          <div class="stat-label">Despesas</div>
          <div class="stat-value" style="color: #f87171">
            R$ {{ formatCurrency(totalDespesas) }}
          </div>
          <div class="stat-sub">
            ↓ {{ qtdDespesas }} {{ qtdDespesas === 1 ? 'saída' : 'saídas' }}
          </div>
        </div>
      </v-col>
      <v-col cols="12" md="4">
        <div class="stat-card" :class="saldo >= 0 ? 'stat-card--blue' : 'stat-card--orange'">
          <div class="stat-label">Saldo</div>
          <div class="stat-value" :style="`color: ${saldo >= 0 ? '#60a5fa' : '#fb923c'}`">
            R$ {{ formatCurrency(saldo) }}
          </div>
          <div class="stat-sub">{{ saldo >= 0 ? '✓ Positivo' : '⚠ Negativo' }}</div>
        </div>
      </v-col>
    </v-row>

    <div class="toolbar">
      <div class="filter-group">
        <button
          v-for="op in [
            { v: 'todos', l: 'Todos' },
            { v: 'Receita', l: 'Receitas' },
            { v: 'Despesa', l: 'Despesas' },
          ]"
          :key="op.v"
          class="f-btn"
          :class="{ 'f-btn--active': filtro === op.v }"
          :style="
            filtro === op.v && op.v === 'Receita'
              ? 'color:#4ade80;border-color:rgba(74,222,128,0.3);background:rgba(74,222,128,0.07)'
              : filtro === op.v && op.v === 'Despesa'
                ? 'color:#f87171;border-color:rgba(248,113,113,0.3);background:rgba(248,113,113,0.07)'
                : ''
          "
          @click="filtro = op.v as any"
        >
          {{ op.l }}
        </button>
      </div>
      <div class="search-box">
        <v-icon size="14" style="color: rgba(255, 255, 255, 0.25); flex-shrink: 0"
          >mdi-magnify</v-icon
        >
        <input
          v-model="busca"
          class="search-input"
          placeholder="Buscar categoria ou descrição..."
        />
      </div>
    </div>

    <div v-if="transacoesFiltradas.length === 0" class="empty-state">
      <v-icon size="48" style="color: rgba(255, 255, 255, 0.1)">mdi-receipt-text-outline</v-icon>
      <p>Nenhuma transação encontrada</p>
    </div>

    <div v-else class="tx-list">
      <div v-for="(t, i) in transacoesFiltradas" :key="i" class="tx-row">
        <div
          class="tx-indicator"
          :class="t.tipo === 'Receita' ? 'tx-indicator--r' : 'tx-indicator--d'"
        />
        <div class="tx-icon" :class="t.tipo === 'Receita' ? 'tx-icon--r' : 'tx-icon--d'">
          <Icon
            :icon="iconesCategoria[t.categoria] || 'fluent-emoji:money-with-wings'"
            width="22"
          />
        </div>
        <div class="tx-body">
          <div class="tx-top">
            <span class="tx-cat">{{ t.categoria }}</span>
            <span class="tx-badge" :class="t.tipo === 'Receita' ? 'tx-badge--r' : 'tx-badge--d'">
              <v-icon size="9" style="margin-right: 2px">{{
                t.tipo === 'Receita' ? 'mdi-trending-up' : 'mdi-trending-down'
              }}</v-icon>
              {{ t.tipo }}
            </span>
          </div>
          <div class="tx-desc">{{ t.descricao || 'Sem descrição' }}</div>
        </div>
        <div class="tx-date">
          <v-icon size="12" style="margin-right: 4px; opacity: 0.3">mdi-calendar-outline</v-icon>
          {{ formatarData(t.data) }}
        </div>
        <div class="tx-valor" :class="t.tipo === 'Receita' ? 'tx-valor--r' : 'tx-valor--d'">
          {{ t.tipo === 'Receita' ? '+' : '-' }} R$ {{ formatCurrency(t.valor) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tx-page {
  padding: 8px 0 40px;
  max-width: 1000px;
  margin: 0 auto;
}
.tx-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
}
.eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 4px;
}
.page-title {
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: #fff;
  line-height: 1;
}
.header-badge {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.35);
}
.stat-card {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  padding: 18px 20px;
  position: relative;
  overflow: hidden;
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
}
.stat-card--green::before {
  background: linear-gradient(90deg, transparent, #4ade80, transparent);
}
.stat-card--red::before {
  background: linear-gradient(90deg, transparent, #f87171, transparent);
}
.stat-card--blue::before {
  background: linear-gradient(90deg, transparent, #60a5fa, transparent);
}
.stat-card--orange::before {
  background: linear-gradient(90deg, transparent, #fb923c, transparent);
}
.stat-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 6px;
}
.stat-value {
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  margin-bottom: 4px;
}
.stat-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.25);
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.filter-group {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 4px;
}
.f-btn {
  padding: 6px 16px;
  border-radius: 7px;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.f-btn:not(.f-btn--active):hover {
  color: rgba(255, 255, 255, 0.6);
}
.f-btn--active:not([style*='color']) {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 0 14px;
  height: 38px;
  min-width: 260px;
  transition: border-color 0.2s;
}
.search-box:focus-within {
  border-color: rgba(255, 255, 255, 0.18);
}
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 13px;
  font-family: inherit;
}
.search-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 64px;
  color: rgba(255, 255, 255, 0.2);
  font-size: 14px;
}
.tx-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tx-row {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 14px 18px;
  transition: all 0.2s ease;
}
.tx-row:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}
.tx-indicator {
  width: 3px;
  height: 40px;
  border-radius: 3px;
  flex-shrink: 0;
}
.tx-indicator--r {
  background: linear-gradient(180deg, #4ade80, rgba(74, 222, 128, 0.15));
}
.tx-indicator--d {
  background: linear-gradient(180deg, #f87171, rgba(248, 113, 113, 0.15));
}
.tx-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tx-icon--r {
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.2);
}
.tx-icon--d {
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.2);
}
.tx-body {
  flex: 1;
  min-width: 0;
}
.tx-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}
.tx-cat {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}
.tx-badge {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 7px;
  border-radius: 4px;
}
.tx-badge--r {
  background: rgba(74, 222, 128, 0.1);
  color: #4ade80;
}
.tx-badge--d {
  background: rgba(248, 113, 113, 0.1);
  color: #f87171;
}
.tx-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.25);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}
.tx-date {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.25);
  white-space: nowrap;
  flex-shrink: 0;
}
.tx-valor {
  font-size: 1.05rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  min-width: 120px;
  text-align: right;
  flex-shrink: 0;
}
.tx-valor--r {
  color: #4ade80;
}
.tx-valor--d {
  color: #f87171;
}
</style>
