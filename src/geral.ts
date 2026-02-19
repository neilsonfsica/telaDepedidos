import { reactive, computed, ComputedRef, nextTick, ref } from 'vue'
import { Chart, registerables } from 'chart.js'
import testeService from './services/teste.service.js'
import { Compra, Transacao, Vencimento } from './services/interface.js'
import toast from './plugins/toast.js'

Chart.register(...registerables)

export const opcoesLembretes = [
  { value: 1, title: '1' },
  { value: 3, title: '3' },
  { value: 5, title: '5' },
  { value: 7, title: '7' },
  { value: 15, title: '15' },
  { value: 30, title: '30' },
]

export const categoriasConfig: Record<string, { icone: string; cor: string }> = {
  Aluguel: { icone: 'mdi-home', cor: '#E91E63' },
  Água: { icone: 'mdi-water', cor: '#2196F3' },
  Luz: { icone: 'mdi-lightbulb', cor: '#FFC107' },
  Internet: { icone: 'mdi-wifi', cor: '#9C27B0' },
  Telefone: { icone: 'mdi-phone', cor: '#00BCD4' },
  'Cartão de Crédito': { icone: 'mdi-credit-card', cor: '#FF5722' },
  Financiamento: { icone: 'mdi-bank', cor: '#795548' },
  Escola: { icone: 'mdi-school', cor: '#4CAF50' },
  Academia: { icone: 'mdi-dumbbell', cor: '#FF9800' },
  Seguro: { icone: 'mdi-shield-check', cor: '#607D8B' },
  Streaming: { icone: 'mdi-play-circle', cor: '#E91E63' },
  Outros: { icone: 'mdi-dots-horizontal', cor: '#9E9E9E' },
}

const vencimentoVazio = (): Vencimento => ({
  id: null,
  descricao: '',
  categoria: '',
  valor: '',
  dataVencimento: '',
  lembretes: [],
  observacoes: '',
  pago: false,
  recorrente: false,
  enviarEmail: false,
  emailNotificacao: '',
  adicionarCalendario: false,
})

export const state = reactive({
  usuarioLogado: false,
  loginForm: {
    email: '',
    senha: '',
  },
  erroLogin: '',
  loadingLogin: false,
  movimentacao: [] as Transacao[],
  escolherTipo: ['Despesa', 'Receita'],
  temaEscuro: true,
  despesa: 0,
  receita: 0,
  abaSelecionada: 'dashboard',
  transacoes: [] as Transacao[],
  compras: [] as Compra[],
  vencimentos: [] as Vencimento[],
  vencimentoAtual: vencimentoVazio(),
  filtroMes: new Date().getMonth() + 1,
  filtroAno: new Date().getFullYear(),
  filtroStatus: 'todos' as 'todos' | 'abertos' | 'pagos',
  dialogCadastro: false,
  modoEdicao: false,
  snackbar: false,
  snackbarText: '',
  snackbarColor: 'success',
  meses: [
    { value: 1, title: 'Janeiro' },
    { value: 2, title: 'Fevereiro' },
    { value: 3, title: 'Março' },
    { value: 4, title: 'Abril' },
    { value: 5, title: 'Maio' },
    { value: 6, title: 'Junho' },
    { value: 7, title: 'Julho' },
    { value: 8, title: 'Agosto' },
    { value: 9, title: 'Setembro' },
    { value: 10, title: 'Outubro' },
    { value: 11, title: 'Novembro' },
    { value: 12, title: 'Dezembro' },
  ],
  categorias: [
    'Aluguel',
    'Água',
    'Luz',
    'Internet',
    'Telefone',
    'Cartão de Crédito',
    'Financiamento',
    'Escola',
    'Academia',
    'Seguro',
    'Streaming',
    'Outros',
  ],
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

  // Anos disponíveis para o filtro de vencimentos
  anos: computed(() => {
    const anoAtual = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, i) => anoAtual - 2 + i)
  }),

  // Vencimentos filtrados por mês, ano e status
  vencimentosFiltrados: computed(() => {
    return state.vencimentos
      .filter((v) => {
        const data = new Date(v.dataVencimento)
        const mesMatch = data.getMonth() + 1 === state.filtroMes
        const anoMatch = data.getFullYear() === state.filtroAno

        let statusMatch = true
        if (state.filtroStatus === 'abertos') statusMatch = !v.pago
        if (state.filtroStatus === 'pagos') statusMatch = v.pago

        return mesMatch && anoMatch && statusMatch
      })
      .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())
  }),

  totalAberto: computed(() =>
    computeds.vencimentosFiltrados.value
      .filter((v) => !v.pago)
      .reduce((sum, v) => sum + parseFloat(String(v.valor) || '0'), 0),
  ),

  totalPago: computed(() =>
    computeds.vencimentosFiltrados.value
      .filter((v) => v.pago)
      .reduce((sum, v) => sum + parseFloat(String(v.valor) || '0'), 0),
  ),

  totalGeral: computed(() =>
    computeds.vencimentosFiltrados.value.reduce(
      (sum, v) => sum + parseFloat(String(v.valor) || '0'),
      0,
    ),
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

export function formatarData(data: string) {
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatarValor(valor: string | number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor))
}

export function getIconeCategoria(categoria: string) {
  return categoriasConfig[categoria]?.icone || 'mdi-currency-usd'
}

export function getCorCategoria(categoria: string) {
  return categoriasConfig[categoria]?.cor || '#9E9E9E'
}

export function diasParaVencimento(vencimento: Vencimento) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const dataVenc = new Date(vencimento.dataVencimento)
  dataVenc.setHours(0, 0, 0, 0)
  return Math.ceil((dataVenc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

export function getCorStatus(vencimento: Vencimento) {
  if (vencimento.pago) return 'success'
  const dias = diasParaVencimento(vencimento)
  if (dias < 0) return 'error'
  if (dias <= 7) return 'warning'
  return 'info'
}

export function getTextoStatus(vencimento: Vencimento) {
  const dias = diasParaVencimento(vencimento)
  if (dias < 0) return 'VENCIDO'
  if (dias === 0) return 'HOJE'
  if (dias === 1) return 'AMANHÃ'
  if (dias <= 7) return `${dias} DIAS`
  return ''
}

export function getClasseCard(vencimento: Vencimento) {
  if (vencimento.pago) return 'vencimento-pago'
  const dias = diasParaVencimento(vencimento)
  if (dias < 0) return 'vencimento-vencido'
  if (dias <= 7) return 'vencimento-proximo'
  return 'vencimento-normal'
}

function formatarDataCalendar(data: Date) {
  return data.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

export const actions = {
  logout() {
    localStorage.removeItem('token')
    state.usuarioLogado = false
    window.location.reload()
  },
  checkLogin() {
    const token = localStorage.getItem('token')

    state.usuarioLogado = !!token
  },

  async login() {
    try {
      state.loadingLogin = true
      state.erroLogin = ''

      const response = await testeService.login({
        email: state.loginForm.email,
        senha: state.loginForm.senha,
      })

      localStorage.setItem('token', response.token)
      state.usuarioLogado = true
      window.location.reload()
    } catch (error: any) {
      state.erroLogin = error.response?.data?.error || 'Erro ao realizar login'
    } finally {
      state.loadingLogin = false
    }
  },

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
        const categoriasList = Object.keys(despesasPorCategoria)
        const valores = Object.values(despesasPorCategoria)
        if (categoriasList.length > 0 && valores.some((v) => v > 0)) {
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
              labels: categoriasList,
              datasets: [
                {
                  data: valores,
                  backgroundColor: categoriasList.map((c) => cores[c] || '#888'),
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
    if (!state.novaTransacao.tipo) {
      toast.warning('Selecione o tipo da transação')
      return
    }
    if (!state.novaTransacao.categoria) {
      toast.warning('Selecione uma categoria')
      return
    }
    if (!state.novaTransacao.valor || state.novaTransacao.valor <= 0) {
      toast.warning('Informe um valor maior que zero')
      return
    }

    try {
      const response = await testeService.insertMovimentacao({
        valor: state.novaTransacao.valor,
        descricao: state.novaTransacao.descricao,
        categoria: state.novaTransacao.categoria,
        tipo: state.novaTransacao.tipo,
      })

      if (response?.success) {
        state.transacoes.push({ ...state.novaTransacao, id: response.data?.insertId })
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
        toast.success(response.message)

        state.chart?.destroy()
        state.chart = null
        state.chartCategoria?.destroy()
        state.chartCategoria = null

        state.abaSelecionada = 'dashboard'
        await nextTick()
        await actions.atualizarGraficos()
      } else {
        toast.error(response?.message || 'Erro ao salvar transação')
      }
    } catch (error: any) {
      console.error('Erro no salvarTransacao:', error)
      toast.error(error?.message || 'Erro ao salvar transação')
    }
  },
  adicionarCompra() {
    state.compras.push({ ...state.novaCompra })
    state.novaCompra = { nome: '', quantidade: 1 }
  },
  usarItem(i: number) {
    if (state.compras[i].quantidade > 0) state.compras[i].quantidade -= 1
  },

  mostrarMensagem(texto: string, cor: string) {
    state.snackbarText = texto
    state.snackbarColor = cor
    state.snackbar = true
  },

  salvarDados() {
    localStorage.setItem('vencimentos', JSON.stringify(state.vencimentos))
  },

  carregarDados() {
    const dados = localStorage.getItem('vencimentos')
    if (dados) {
      state.vencimentos = JSON.parse(dados)
    }
  },

  togglePagamento(vencimento: Vencimento) {
    actions.salvarDados()
    actions.mostrarMensagem(
      vencimento.pago ? 'Pagamento registrado!' : 'Pagamento desmarcado',
      'success',
    )
  },

  editarVencimento(vencimento: Vencimento) {
    state.modoEdicao = true
    state.vencimentoAtual = { ...vencimento }
    state.dialogCadastro = true
  },

  excluirVencimento(vencimento: Vencimento) {
    if (confirm('Deseja realmente excluir este vencimento?')) {
      const index = state.vencimentos.findIndex((v) => v.id === vencimento.id)
      state.vencimentos.splice(index, 1)
      actions.salvarDados()
      actions.mostrarMensagem('Vencimento excluído!', 'success')
    }
  },

  fecharDialog() {
    state.dialogCadastro = false
    state.modoEdicao = false
    state.vencimentoAtual = vencimentoVazio()
  },

  async salvarVencimento() {
    const v = state.vencimentoAtual

    if (!v.descricao || !v.valor || !v.dataVencimento || !v.categoria) {
      actions.mostrarMensagem('Preencha todos os campos obrigatórios', 'error')
      return
    }

    if (v.enviarEmail && !v.emailNotificacao) {
      actions.mostrarMensagem('Informe o email para notificações', 'error')
      return
    }

    if (state.modoEdicao) {
      const index = state.vencimentos.findIndex((item) => item.id === v.id)
      state.vencimentos[index] = { ...v }
      actions.mostrarMensagem('Vencimento atualizado!', 'success')
    } else {
      v.id = Date.now()
      state.vencimentos.push({ ...v })
      actions.mostrarMensagem('Vencimento cadastrado!', 'success')
    }

    if (v.adicionarCalendario) {
      await actions.adicionarAoGoogleCalendar(v)
    }

    if (v.enviarEmail) {
      actions.agendarNotificacoesEmail(v)
    }

    actions.salvarDados()
    actions.fecharDialog()
  },

  async adicionarAoGoogleCalendar(vencimento: Vencimento) {
    try {
      const dataVencimento = new Date(vencimento.dataVencimento)

      for (const diasAntes of vencimento.lembretes) {
        const dataLembrete = new Date(dataVencimento)
        dataLembrete.setDate(dataLembrete.getDate() - diasAntes)

        const summary = `🔔 Lembrete: ${vencimento.descricao}`
        const description = `Vencimento de ${vencimento.categoria}\nValor: ${formatarValor(vencimento.valor)}\n${vencimento.observacoes || ''}`
        const fim = new Date(dataLembrete.getTime() + 30 * 60000)

        const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(summary)}&details=${encodeURIComponent(description)}&dates=${formatarDataCalendar(dataLembrete)}/${formatarDataCalendar(fim)}`

        console.log('URL Google Calendar:', googleCalendarUrl)
      }

      actions.mostrarMensagem('Lembretes adicionados ao calendário!', 'success')
    } catch (error) {
      console.error('Erro ao adicionar ao Google Calendar:', error)
      actions.mostrarMensagem('Erro ao adicionar ao calendário', 'error')
    }
  },

  agendarNotificacoesEmail(vencimento: Vencimento) {
    console.log('Notificações agendadas para:', {
      email: vencimento.emailNotificacao,
      vencimento: vencimento.descricao,
      lembretes: vencimento.lembretes,
    })

    const emailConfig = {
      to: vencimento.emailNotificacao,
      subject: `Lembrete de Vencimento: ${vencimento.descricao}`,
      body: `
        Olá!

        Este é um lembrete de que a conta "${vencimento.descricao}" vence em breve.

        Categoria: ${vencimento.categoria}
        Valor: ${formatarValor(vencimento.valor)}
        Data de Vencimento: ${formatarData(vencimento.dataVencimento)}

        ${vencimento.observacoes ? 'Observações: ' + vencimento.observacoes : ''}

        Atenciosamente,
        Sistema de Controle Financeiro
      `,
    }

    // Aqui você faria a chamada real para o serviço de email
    // sendEmail(emailConfig)
  },
}
