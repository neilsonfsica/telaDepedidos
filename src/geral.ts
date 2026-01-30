import { reactive, computed, ComputedRef, nextTick } from 'vue'
import { Chart, registerables, ChartConfiguration, ChartOptions } from 'chart.js'
import testeService from './services/teste.service.js'
import { Icon } from '@iconify/vue'
import { Compra, Transacao } from './services/interface.js'

Chart.register(...registerables)

export const state = reactive({
  movimentacao: [] as Transacao[],
  escolherTipo: ['Despesa', 'Receita'],
  temaEscuro: true,
  despesa: 0,
  receita: 0,
  abaSelecionada: 'dashboard',
  transacoes: [] as Transacao[],
  compras: [] as Compra[],
  novaTransacao: {
    data: new Date().toISOString().substring(0, 10),
    tipo: 'Despesa',
    categoria: '',
    descricao: '',
    valor: 0,
  } as Transacao,
  novaCompra: { nome: '', quantidade: 1 } as Compra,
  chart: null as Chart<'bar', number[], string> | null,
  chartCategoria: null as Chart<'pie', number[], string> | null,
  categoriasDespesa: [
    'Alimentação',
    'Transporte',
    'Lazer',
    'Saúde',
    'Internet',
    'Água',
    'Luz',
    'Outros',
  ],
  categoriasReceita: ['Salário', 'Investimentos', 'Outros'],
  iconesCategoria: {
    Alimentação: 'fluent-emoji:hamburger',
    Transporte: 'fluent-emoji:oncoming-automobile',
    Lazer: 'fluent-emoji:video-game',
    Saúde: 'fluent-emoji:pill',
    Internet: 'fluent-emoji:globe-with-meridians',
    Água: 'fluent-emoji:droplet',
    Luz: 'fluent-emoji:light-bulb',
    Salário: 'fluent-emoji:money-bag',
    Investimentos: 'fluent-emoji:chart-increasing',
    Outros: 'fluent-emoji:package',
    Escritório: 'fluent-emoji:briefcase',
  } as Record<string, string>,
})

export const computeds = {
  categoriaFiltro: computed(() =>
    state.novaTransacao.tipo === 'Receita' ? state.categoriasReceita : state.categoriasDespesa,
  ),
  receitas: computed(() =>
    state.transacoes.reduce((total, t) => (t.tipo === 'Receita' ? total + t.valor : total), 0),
  ),
  despesas: computed(() =>
    state.transacoes.reduce((total, t) => (t.tipo === 'Despesa' ? total + t.valor : total), 0),
  ),
}

export const saldo: ComputedRef<number> = computed(
  () => computeds.receitas.value - computeds.despesas.value,
)

export function formatCurrency(value: number | string | null | undefined) {
  const num = Number(value) || 0
  const sign = num < 0 ? '-' : ''
  const abs = Math.abs(num)
  return (
    sign +
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      abs,
    )
  )
}

export function parseNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  const cleaned = String(value)
    .trim()
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .replace(/[^0-9.-]/g, '')
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

export const actions = {
  async getDespesa() {
    try {
      const response = await testeService.getDespesa()
      state.despesa = response?.total_despesas || 0
    } catch {
      state.despesa = 0
    }
  },
  async getReceita() {
    try {
      const response = await testeService.getReceita()
      state.receita = response?.total_receita || 0
    } catch {
      state.receita = 0
    }
  },
  async getMovimentacao() {
    try {
      const response = await testeService.getMovimentacao()
      state.transacoes = response || []
    } catch {
      state.transacoes = []
    }
  },
  toggleTema() {
    state.temaEscuro = !state.temaEscuro
  },
  async atualizarGraficos() {
    await nextTick()
    const receita = computeds.receitas.value
    const despesa = computeds.despesas.value

    const canvas = document.getElementById('grafico') as HTMLCanvasElement | null
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        if (!state.chart) {
          state.chart = new Chart<'bar', number[], string>(ctx, {
            type: 'bar',
            data: {
              labels: ['Receitas', 'Despesas'],
              datasets: [
                {
                  label: 'Valores em R$',
                  data: [receita, despesa],
                  backgroundColor: ['#43a047', '#e53935'],
                },
              ],
            },
            options: { responsive: true, maintainAspectRatio: true },
          })
        } else {
          state.chart.data.datasets[0].data = [receita, despesa]
          state.chart.update()
        }
      }
    }

    const despesasPorCategoria: Record<string, number> = {}
    state.transacoes
      .filter((t) => t.tipo === 'Despesa')
      .forEach((t) => {
        despesasPorCategoria[t.categoria] = (despesasPorCategoria[t.categoria] || 0) + t.valor
      })

    const canvasCat = document.getElementById('graficoCategoria') as HTMLCanvasElement | null
    if (canvasCat) {
      const ctxCat = canvasCat.getContext('2d')
      if (ctxCat) {
        state.chartCategoria?.destroy()
        const categorias = Object.keys(despesasPorCategoria)
        const valores = Object.values(despesasPorCategoria)
        if (categorias.length > 0 && valores.some((v) => v > 0)) {
          const cores: Record<string, string> = {
            Alimentação: '#fbc02d',
            Transporte: '#fb8c00',
            Lazer: '#43a047',
            Saúde: '#1e88e5',
            Internet: '#9c27b0',
            Água: '#00bcd4',
            Luz: '#ffeb3b',
            Escritório: '#607d8b',
            Outros: '#888888',
          }

          state.chartCategoria = new Chart<'pie', number[], string>(ctxCat, {
            type: 'pie',
            data: {
              labels: categorias,
              datasets: [
                {
                  data: valores,
                  backgroundColor: categorias.map((c) => cores[c] || '#888'),
                  borderColor: '#fff',
                  borderWidth: 2,
                  borderRadius: 10,
                  hoverOffset: 15,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 20, padding: 15 } },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.label || ''
                      const value = context.parsed || 0
                      const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                      const percentage = ((value / total) * 100).toFixed(1)
                      return `${label}: R$ ${formatCurrency(value)} (${percentage}%)`
                    },
                  },
                },
              },
            },
          })
        }
      }
    }
  },

  async salvarTransacao() {
    try {
      const response = await testeService.insertMovimentacao({
        valor: state.novaTransacao.valor,
        descricao: state.novaTransacao.descricao,
        categoria: state.novaTransacao.categoria,
        tipo: state.novaTransacao.tipo,
      })
      if (response?.insertId) {
        state.transacoes.push({ ...state.novaTransacao, id: response.insertId })
        state.novaTransacao = {
          data: new Date().toISOString().substring(0, 10),
          tipo: 'Despesa',
          categoria: '',
          descricao: '',
          valor: 0,
        }
        await actions.getDespesa()
        await actions.getReceita()
        await actions.getMovimentacao()
        await actions.atualizarGraficos()
      }
    } catch {}
  },
  adicionarCompra() {
    state.compras.push({ ...state.novaCompra })
    state.novaCompra = { nome: '', quantidade: 1 }
  },
  usarItem(i: number) {
    if (state.compras[i].quantidade > 0) state.compras[i].quantidade -= 1
  },
}
