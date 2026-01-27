import { ref, computed } from 'vue'
import { Chart, registerables } from 'chart.js'
import type { Transacao, Compra } from './App.vue'
import testeService from './services/teste.service.js'

Chart.register(...registerables)

export const state = {
  temaEscuro: ref(true),
  despesa: ref<any>(null),
  receita: ref<any>(null),
  abaSelecionada: ref('dashboard'),
  transacoes: ref<Transacao[]>([]),
  compras: ref<Compra[]>([]),
  novaTransacao: ref<Transacao>({
    data: new Date().toISOString().substring(0, 10),
    tipo: 'Despesa',
    categoria: '',
    descricao: '',
    valor: 0,
  }),
  novaCompra: ref<Compra>({ nome: '', quantidade: 1 }),
  chart: null as Chart | null,
  chartCategoria: null as Chart | null,
  categoriasDespesa: ref([
    'Alimentação',
    'Transporte',
    'Lazer',
    'Saúde',
    'Internet',
    'Água',
    'Luz',
    'Outros',
  ]),
  categoriasReceita: ref(['Salário', 'Investimentos', 'Outros']),
  iconesCategoria: ref({
    Alimentação: 'mdi-food',
    Transporte: 'mdi-car',
    Lazer: 'mdi-emoticon-happy',
    Saúde: 'mdi-hospital-box',
    Internet: 'mdi-wifi',
    Água: 'mdi-water',
    Luz: 'mdi-lightbulb',
    Salário: 'mdi-cash',
    Investimentos: 'mdi-finance',
    Outros: 'mdi-cash-multiple',
  } as Record<string, string>),
}

export const getters: any = {
  categoriasFiltradas: computed(() =>
    state.novaTransacao.value.tipo === 'Receita'
      ? state.categoriasReceita.value
      : state.categoriasDespesa.value,
  ),
  receitas: computed(() =>
    state.transacoes.value.filter((t) => t.tipo === 'Receita').reduce((a, t) => a + t.valor, 0),
  ),
  despesas: computed(() =>
    state.transacoes.value.filter((t) => t.tipo === 'Despesa').reduce((a, t) => a + t.valor, 0),
  ),
  saldo: computed(() => getters.receitas.value - getters.despesas.value),
}

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
    const response = await testeService.getDespesa()
    state.despesa.value = response.total_despesas
    await actions.atualizarGraficos()
  },

  async getReceita() {
    const response = await testeService.getReceita()
    state.receita.value = response.total_receita
    await actions.atualizarGraficos()
  },

  async toggleTema() {
    state.temaEscuro.value = !state.temaEscuro.value
  },

  async atualizarGraficos() {
    const receita = parseNumber(state.receita?.value)
    const despesa = parseNumber(state.despesa?.value)
    console.debug(
      '[atualizarGraficos] receita raw:',
      state.receita?.value,
      '=>',
      receita,
      typeof state.receita?.value,
    )
    console.debug(
      '[atualizarGraficos] despesa raw:',
      state.despesa?.value,
      '=>',
      despesa,
      typeof state.despesa?.value,
    )

    const canvas = document.getElementById('grafico') as HTMLCanvasElement | null
    if (!canvas) {
      console.warn('Canvas #grafico não encontrado')
    } else {
      const ctx2 = canvas.getContext('2d')
      if (!ctx2) {
        console.warn('Não foi possível obter 2D context do canvas #grafico')
      } else {
        const setupChart = () => {
          if (state.chart) {
            state.chart.data.labels = ['Receitas', 'Despesas']
            if (state.chart.data.datasets && state.chart.data.datasets[0]) {
              state.chart.data.datasets[0].data = [receita, despesa]
              state.chart.data.datasets[0].backgroundColor = ['#43a047', '#e53935']
            } else {
              state.chart.data.datasets = [
                {
                  label: 'Valores em Reais',
                  data: [receita, despesa],
                  backgroundColor: ['#43a047', '#e53935'],
                },
              ]
            }

            try {
              ;(state.chart.options as any).scales = { y: { beginAtZero: true } }
            } catch {}
            state.chart.update()

            try {
              state.chart.resize()
            } catch {}
          } else {
            state.chart = new Chart(ctx2, {
              type: 'bar',
              data: {
                labels: ['Receitas', 'Despesas'],
                datasets: [
                  {
                    label: 'Valores em Reais',
                    data: [receita, despesa],
                    backgroundColor: ['#43a047', '#e53935'],
                  },
                ],
              },
              options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              },
            })
          }
        }
        window.requestAnimationFrame(() => setupChart())
      }
    }

    const despesasPorCategoria: Record<string, number> = {}
    state.transacoes.value
      .filter((t) => t.tipo === 'Despesa')
      .forEach(
        (t) =>
          (despesasPorCategoria[t.categoria] = (despesasPorCategoria[t.categoria] || 0) + t.valor),
      )

    const ctxCatEl = document.getElementById('graficoCategoria') as HTMLCanvasElement | null
    if (ctxCatEl) {
      const ctxCat = ctxCatEl.getContext('2d')
      if (!ctxCat) {
        console.warn('Não foi possível obter 2D context do canvas #graficoCategoria')
      } else {
        if (state.chartCategoria) state.chartCategoria.destroy()
        state.chartCategoria = new Chart(ctxCat, {
          type: 'pie',
          data: {
            labels: Object.keys(despesasPorCategoria),
            datasets: [
              {
                data: Object.values(despesasPorCategoria),
                backgroundColor: Object.keys(despesasPorCategoria).map((c) => {
                  switch (c) {
                    case 'Alimentação':
                      return '#e53935'
                    case 'Transporte':
                      return '#fb8c00'
                    case 'Lazer':
                      return '#43a047'
                    case 'Saúde':
                      return '#1e88e5'
                    case 'Internet':
                      return '#9c27b0'
                    case 'Água':
                      return '#00bcd4'
                    case 'Luz':
                      return '#ffeb3b'
                    default:
                      return '#888'
                  }
                }),
              },
            ],
          },
          options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
        })
      }
    }
  },

  async salvarTransacao() {
    try {
      const response = await testeService.insertMovimentacao({
        valor: state.novaTransacao.value.valor,
        descricao: state.novaTransacao.value.descricao,
        categoria: state.novaTransacao.value.categoria,
        tipo: state.novaTransacao.value.tipo,
      })

      console.debug('Resposta insertMovimentacao:', response)

      if (response?.insertId) {
        state.transacoes.value.push({
          ...state.novaTransacao.value,
          id: response.insertId,
        })

        state.novaTransacao.value = {
          data: new Date().toISOString().substring(0, 10),
          tipo: 'Despesa',
          categoria: '',
          descricao: '',
          valor: 0,
        }

        await actions.getDespesa()
        await actions.getReceita()
        await actions.atualizarGraficos()

        console.log('Transação salva com sucesso! ID:', response.insertId)
      } else {
        console.error('Erro: insertId não retornado pela API')
      }
    } catch (error) {
      console.error('Erro ao salvar transação:', error)
    }
  },

  async adicionarCompra() {
    state.compras.value.push({ ...state.novaCompra.value })
    state.novaCompra.value = { nome: '', quantidade: 1 }
  },

  async usarItem(i: number) {
    if (state.compras.value[i].quantidade > 0) {
      state.compras.value[i].quantidade -= 1
    }
  },
}
