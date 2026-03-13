<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { formatCurrency } from '../geral'
import Chart from 'chart.js/auto'

// ─── Props ───────────────────────────────────────────────────────────────────
const props = defineProps<{
  receita: number
  despesa: number
  saldo: number
  evolucao: { mes: string; receita: number; despesa: number }[]
  transacoes: { categoria: string; valor: number; tipo: 'receita' | 'despesa' }[]
}>()

// ─── Computeds ───────────────────────────────────────────────────────────────
const taxaEconomia = computed(() => {
  if (!props.receita || props.receita === 0) return 0
  return Math.round(((props.receita - props.despesa) / props.receita) * 100)
})

const corTaxa = computed(() => {
  if (taxaEconomia.value >= 30) return '#4ade80'
  if (taxaEconomia.value >= 10) return '#facc15'
  return '#f87171'
})

const maiorCategoria = computed(() => {
  const despesas = props.transacoes.filter((t) => t.tipo === 'despesa')
  if (!despesas.length) return null
  const agrupado = despesas.reduce<Record<string, number>>((acc, t) => {
    acc[t.categoria] = (acc[t.categoria] || 0) + t.valor
    return acc
  }, {})
  const maior = Object.entries(agrupado).sort((a, b) => b[1] - a[1])[0]
  return { nome: maior[0], valor: maior[1] }
})

const percentualMaior = computed(() => {
  if (!maiorCategoria.value || !props.despesa) return 0
  return Math.round((maiorCategoria.value.valor / props.despesa) * 100)
})

// ─── Gráficos ────────────────────────────────────────────────────────────────
let chartEvolucao: Chart | null = null
let chartBarras: Chart | null = null
let chartCategorias: Chart | null = null

function buildGradient(ctx: CanvasRenderingContext2D, color: string) {
  const grad = ctx.createLinearGradient(0, 0, 0, 340)
  grad.addColorStop(0, color.replace(')', ', 0.25)').replace('rgb', 'rgba'))
  grad.addColorStop(1, color.replace(')', ', 0)').replace('rgb', 'rgba'))
  return grad
}

function renderEvolucao() {
  const el = document.getElementById('graficoEvolucao') as HTMLCanvasElement | null
  if (!el) return
  const ctx = el.getContext('2d')!
  const existingEv = Chart.getChart(el)
  if (existingEv) existingEv.destroy()
  chartEvolucao?.destroy()
  chartEvolucao = null

  chartEvolucao = new Chart(ctx, {
    type: 'line',
    data: {
      labels: props.evolucao.map((e) => e.mes),
      datasets: [
        {
          label: 'Receitas',
          data: props.evolucao.map((e) => e.receita),
          borderColor: '#4ade80',
          backgroundColor: buildGradient(ctx, 'rgb(74,222,128)'),
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#4ade80',
          pointBorderColor: '#0f1520',
          pointBorderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Despesas',
          data: props.evolucao.map((e) => e.despesa),
          borderColor: '#f87171',
          backgroundColor: buildGradient(ctx, 'rgb(248,113,113)'),
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#f87171',
          pointBorderColor: '#0f1520',
          pointBorderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: 'rgba(255,255,255,0.5)',
            font: { size: 11 },
            boxWidth: 10,
            boxHeight: 10,
            borderRadius: 3,
            useBorderRadius: true,
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: '#1a1f2e',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          titleColor: 'rgba(255,255,255,0.7)',
          bodyColor: '#fff',
          padding: 12,
          callbacks: { label: (ctx) => ` R$ ${formatCurrency(ctx.parsed.y)}` },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 11 } },
          border: { color: 'transparent' },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: 'rgba(255,255,255,0.35)',
            font: { size: 11 },
            callback: (v: any) => `R$ ${formatCurrency(v)}`,
          },
          border: { color: 'transparent' },
        },
      },
    },
  })
}

function renderBarras() {
  const el = document.getElementById('grafico') as HTMLCanvasElement | null
  if (!el) return
  const ctx = el.getContext('2d')!
  const existingBar = Chart.getChart(el)
  if (existingBar) existingBar.destroy()
  chartBarras?.destroy()
  chartBarras = null

  const maxVal = Math.max(props.receita, props.despesa, 1)

  chartBarras = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Receitas', 'Despesas'],
      datasets: [
        {
          label: 'Valores em R$',
          data: [props.receita, props.despesa],
          backgroundColor: ['rgba(74,222,128,0.7)', 'rgba(248,113,113,0.7)'],
          borderColor: ['#4ade80', '#f87171'],
          borderWidth: 2,
          borderRadius: 10,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1a1d2e',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#fff',
          bodyColor: 'rgba(255,255,255,0.6)',
          padding: 12,
          callbacks: { label: (ctx) => ` R$ ${formatCurrency(ctx.parsed.y)}` },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 13, weight: 'bold' } },
          border: { display: false },
        },
        y: {
          min: 0,
          max: Math.ceil(maxVal * 1.25),
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: 'rgba(255,255,255,0.3)',
            font: { size: 11 },
            callback: (v: any) => `R$ ${formatCurrency(Number(v))}`,
          },
          border: { display: false },
        },
      },
    },
  })
}

function renderCategorias() {
  const el = document.getElementById('graficoCategoria') as HTMLCanvasElement | null
  if (!el) return
  const ctx = el.getContext('2d')!
  const existingCat = Chart.getChart(el)
  if (existingCat) existingCat.destroy()
  chartCategorias?.destroy()
  chartCategorias = null

  const despesas = props.transacoes.filter((t) => t.tipo === 'despesa')
  const agrupado = despesas.reduce<Record<string, number>>((acc, t) => {
    acc[t.categoria] = (acc[t.categoria] || 0) + t.valor
    return acc
  }, {})

  const labels = Object.keys(agrupado)
  const data = Object.values(agrupado)
  const cores: Record<string, string> = {
    Alimentação: '#fbbf24',
    Transporte: '#fb923c',
    Lazer: '#4ade80',
    Saúde: '#60a5fa',
    Internet: '#a855f7',
    Água: '#22d3ee',
    Luz: '#facc15',
    Escritório: '#94a3b8',
    Outros: '#6b7280',
  }

  if (!labels.length || !data.some((v) => v > 0)) return

  chartCategorias = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: labels.map((c) => (cores[c] || '#6b7280') + 'cc'),
          borderColor: labels.map((c) => cores[c] || '#6b7280'),
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'rgba(255,255,255,0.5)',
            font: { size: 11 },
            boxWidth: 10,
            boxHeight: 10,
            borderRadius: 3,
            useBorderRadius: true,
            padding: 14,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          backgroundColor: '#1a1d2e',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#fff',
          bodyColor: 'rgba(255,255,255,0.6)',
          padding: 12,
          callbacks: {
            label: (ctx) => {
              const value = ctx.parsed || 0
              const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0)
              return ` R$ ${formatCurrency(value)}  (${((value / total) * 100).toFixed(1)}%)`
            },
          },
        },
      },
    },
  })
}

function renderTodos() {
  renderEvolucao()
  renderBarras()
  renderCategorias()
}

onMounted(renderTodos)

watch(() => [props.evolucao, props.transacoes, props.receita, props.despesa], renderTodos, {
  deep: true,
})
</script>

<template>
  <!-- ── Cards de resumo ──────────────────────────────────── -->
  <v-row class="mb-2">
    <!-- Receitas -->
    <v-col cols="12" md="3">
      <v-card
        rounded="xl"
        elevation="0"
        class="summary-card"
        style="border-left: 3px solid #4ade80"
      >
        <div class="glow glow--green" />
        <v-card-text class="pa-5">
          <div class="card-label" style="color: rgba(255, 255, 255, 0.4)">Receitas</div>
          <div class="card-value" style="color: #fff">R$ {{ formatCurrency(receita) }}</div>
          <div class="card-sub" style="color: #4ade80">
            <v-icon size="13">mdi-trending-up</v-icon> Este mês
          </div>
        </v-card-text>
        <div
          class="card-icon-bg"
          style="background: rgba(74, 222, 128, 0.06); border-color: rgba(74, 222, 128, 0.18)"
        >
          <v-icon color="#4ade80" size="20">mdi-trending-up</v-icon>
        </div>
      </v-card>
    </v-col>

    <!-- Despesas -->
    <v-col cols="12" md="3">
      <v-card
        rounded="xl"
        elevation="0"
        class="summary-card"
        style="border-left: 3px solid #f87171"
      >
        <div class="glow glow--red" />
        <v-card-text class="pa-5">
          <div class="card-label" style="color: rgba(255, 255, 255, 0.4)">Despesas</div>
          <div class="card-value" style="color: #fff">R$ {{ formatCurrency(despesa) }}</div>
          <div class="card-sub" style="color: #f87171">
            <v-icon size="13">mdi-trending-down</v-icon> Este mês
          </div>
        </v-card-text>
        <div
          class="card-icon-bg"
          style="background: rgba(248, 113, 113, 0.06); border-color: rgba(248, 113, 113, 0.18)"
        >
          <v-icon color="#f87171" size="20">mdi-trending-down</v-icon>
        </div>
      </v-card>
    </v-col>

    <!-- Saldo -->
    <v-col cols="12" md="3">
      <v-card
        rounded="xl"
        elevation="0"
        class="summary-card"
        :style="`border-left: 3px solid ${saldo >= 0 ? '#60a5fa' : '#fb923c'}`"
      >
        <div class="glow" :class="saldo >= 0 ? 'glow--blue' : 'glow--orange'" />
        <v-card-text class="pa-5">
          <div class="card-label" style="color: rgba(255, 255, 255, 0.4)">Saldo</div>
          <div class="card-value" :style="`color: ${saldo >= 0 ? '#60a5fa' : '#fb923c'}`">
            R$ {{ formatCurrency(saldo) }}
          </div>
          <div class="card-sub" :style="`color: ${saldo >= 0 ? '#60a5fa' : '#fb923c'}`">
            <v-icon size="13">{{
              saldo >= 0 ? 'mdi-check-circle-outline' : 'mdi-alert-outline'
            }}</v-icon>
            {{ saldo >= 0 ? 'Positivo' : 'Negativo' }}
          </div>
        </v-card-text>
        <div
          class="card-icon-bg"
          :style="`background: ${saldo >= 0 ? 'rgba(96,165,250,0.06)' : 'rgba(251,146,60,0.06)'}; border-color: ${saldo >= 0 ? 'rgba(96,165,250,0.18)' : 'rgba(251,146,60,0.18)'}`"
        >
          <v-icon :color="saldo >= 0 ? '#60a5fa' : '#fb923c'" size="20">mdi-wallet-outline</v-icon>
        </div>
      </v-card>
    </v-col>

    <!-- Taxa de Economia -->
    <v-col cols="12" md="3">
      <v-card
        rounded="xl"
        elevation="0"
        class="summary-card"
        :style="`border-left: 3px solid ${corTaxa}`"
      >
        <div class="glow" :style="`background:${corTaxa}; opacity:0.15; filter:blur(45px)`" />
        <v-card-text class="pa-5">
          <div class="card-label" style="color: rgba(255, 255, 255, 0.4)">Taxa de Economia</div>
          <div class="card-value" :style="`color: ${corTaxa}`">{{ taxaEconomia }}%</div>
          <div class="card-sub" :style="`color: ${corTaxa}`">
            <v-icon size="13">mdi-piggy-bank-outline</v-icon>
            {{ taxaEconomia >= 30 ? 'Excelente' : taxaEconomia >= 10 ? 'Razoável' : 'Atenção' }}
          </div>
        </v-card-text>
        <div class="card-icon-bg" :style="`background:${corTaxa}11; border-color:${corTaxa}33`">
          <v-icon :color="corTaxa" size="20">mdi-piggy-bank-outline</v-icon>
        </div>
      </v-card>
    </v-col>
  </v-row>

  <!-- ── Maior gasto + Evolução 6 meses ───────────────────── -->
  <v-row class="mb-2">
    <!-- Maior categoria -->
    <v-col cols="12" md="4" v-if="maiorCategoria">
      <v-card
        rounded="xl"
        elevation="0"
        class="summary-card"
        style="border-left: 3px solid #a855f7; height: 100%"
      >
        <div class="glow glow--purple" />
        <v-card-text class="pa-5">
          <div class="card-label mb-3" style="color: rgba(255, 255, 255, 0.4)">
            <v-icon size="13" color="#a855f7">mdi-fire</v-icon>
            Maior gasto do mês
          </div>
          <div class="d-flex align-center justify-space-between mb-4">
            <div>
              <div
                style="color: #fff; font-size: 1.1rem; font-weight: 800; letter-spacing: -0.02em"
              >
                {{ maiorCategoria.nome }}
              </div>
              <div style="color: #a855f7; font-size: 1rem; font-weight: 700; margin-top: 2px">
                R$ {{ formatCurrency(maiorCategoria.valor) }}
              </div>
            </div>
            <div
              class="card-icon-bg"
              style="
                background: rgba(168, 85, 247, 0.06);
                border-color: rgba(168, 85, 247, 0.18);
                position: static;
                width: 44px;
                height: 44px;
              "
            >
              <v-icon color="#a855f7" size="20">mdi-tag-outline</v-icon>
            </div>
          </div>
          <div
            style="
              color: rgba(255, 255, 255, 0.3);
              font-size: 11px;
              font-weight: 600;
              letter-spacing: 0.06em;
              text-transform: uppercase;
              margin-bottom: 6px;
            "
          >
            {{ percentualMaior }}% do total de despesas
          </div>
          <div class="progress-track">
            <div class="progress-bar progress-bar--purple" :style="`width:${percentualMaior}%`" />
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Evolução 6 meses -->
    <v-col cols="12" :md="maiorCategoria ? 8 : 12">
      <v-card
        rounded="xl"
        elevation="0"
        style="
          height: 100%;
          background: linear-gradient(135deg, #0f1520 0%, #1a1f2e 100%);
          border: 1px solid rgba(255, 255, 255, 0.09);
        "
      >
        <v-card-title class="pa-5 pb-0">
          <v-row align="center" no-gutters>
            <v-col>
              <div class="section-eyebrow" style="color: #4ade80">Histórico</div>
              <div class="section-title">Evolução dos últimos 6 meses</div>
            </v-col>
            <v-col cols="auto">
              <v-avatar size="10" color="#4ade80" style="box-shadow: 0 0 8px #4ade80" />
            </v-col>
          </v-row>
        </v-card-title>
        <v-divider class="mt-3 mx-5" style="border-color: rgba(255, 255, 255, 0.06)" />
        <v-card-text class="pa-5 pt-4">
          <div style="position: relative; height: 200px">
            <canvas id="graficoEvolucao"></canvas>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- ── Gráficos originais ────────────────────────────────── -->
  <v-row>
    <v-col cols="12" md="6">
      <v-card
        rounded="xl"
        elevation="0"
        height="100%"
        style="
          background: linear-gradient(135deg, #0f1520 0%, #1a1f2e 100%);
          border: 1px solid rgba(255, 255, 255, 0.09);
        "
      >
        <v-card-title class="pa-5 pb-0">
          <v-row align="center" no-gutters>
            <v-col>
              <div class="section-eyebrow" style="color: #1a6fff">Visão Geral</div>
              <div class="section-title">Receitas x Despesas</div>
            </v-col>
            <v-col cols="auto">
              <v-avatar size="10" color="#1a6fff" style="box-shadow: 0 0 8px #1a6fff" />
            </v-col>
          </v-row>
        </v-card-title>
        <v-divider class="mt-3 mx-5" style="border-color: rgba(255, 255, 255, 0.06)" />
        <v-card-text class="pa-5 pt-4">
          <div style="position: relative; height: 320px">
            <canvas id="grafico"></canvas>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="6">
      <v-card
        rounded="xl"
        elevation="0"
        height="100%"
        style="
          background: linear-gradient(135deg, #0f1520 0%, #1a1f2e 100%);
          border: 1px solid rgba(255, 255, 255, 0.09);
        "
      >
        <v-card-title class="pa-5 pb-0">
          <v-row align="center" no-gutters>
            <v-col>
              <div class="section-eyebrow" style="color: #a855f7">Distribuição</div>
              <div class="section-title">Despesas por Categoria</div>
            </v-col>
            <v-col cols="auto">
              <v-avatar size="10" color="#a855f7" style="box-shadow: 0 0 8px #a855f7" />
            </v-col>
          </v-row>
        </v-card-title>
        <v-divider class="mt-3 mx-5" style="border-color: rgba(255, 255, 255, 0.06)" />
        <v-card-text class="pa-5 pt-4">
          <div style="position: relative; height: 320px">
            <canvas id="graficoCategoria"></canvas>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.summary-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0f1520 0%, #1a1f2e 100%);
  border: 1px solid rgba(255, 255, 255, 0.09);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5) !important;
}
.card-icon-bg {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 6px;
}
.card-value {
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 6px;
}
.card-sub {
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}
.glow {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  filter: blur(45px);
  opacity: 0.18;
  pointer-events: none;
}
.glow--green {
  background: #4ade80;
}
.glow--red {
  background: #f87171;
}
.glow--blue {
  background: #60a5fa;
}
.glow--orange {
  background: #fb923c;
}
.glow--purple {
  background: #a855f7;
}
.progress-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 4px;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}
.progress-bar--purple {
  background: #a855f7;
}
.section-eyebrow {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 2px;
}
.section-title {
  font-size: 1rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.01em;
}
</style>
