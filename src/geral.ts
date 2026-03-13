import { reactive, computed, ComputedRef, nextTick } from 'vue'
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
  saldo: 0,
  usuarioLogado: false,
  usuarioNome: '' as string,
  usuarioEmail: '' as string,
  usuarioFoto: '' as string,
  dialogPerfil: false,
  perfilForm: { email: '' },

  perfilDialog: {
    nomeLocal: '',
    emailLocal: '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
    erroPerfil: '',
    loadingFoto: false,
    loadingSalvar: false,
  },

  loginForm: { email: '', senha: '' },
  erroLogin: '',
  loadingLogin: false,

  cadastroForm: { nome: '', email: '', senha: '' },
  erroCadastro: '',
  loadingCadastro: false,
  telaCadastro: false,

  temaEscuro: true,
  abaSelecionada: 'dashboard',
  escolherTipo: ['Despesa', 'Receita'],

  despesa: 0,
  receita: 0,
  movimentacao: [] as Transacao[],
  transacoes: [] as Transacao[],
  novaTransacao: {
    data: new Date().toISOString().substring(0, 10),
    tipo: 'Despesa',
    categoria: '',
    descricao: '',
    valor: 0,
  } as Transacao,

  compras: [] as Compra[],
  novaCompra: { nome: '', quantidade: 1 } as Compra,
  loadingEstoque: false,

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

  chart: null as Chart<'bar', number[], string> | null,
  chartCategoria: null as Chart<'pie', number[], string> | null,
})

const getVencimentosFiltrados = () =>
  state.vencimentos
    .filter((v) => {
      const data = new Date(v.dataVencimento)
      const mesMatch = data.getMonth() + 1 === state.filtroMes
      const anoMatch = data.getFullYear() === state.filtroAno
      const statusMatch =
        state.filtroStatus === 'abertos' ? !v.pago : state.filtroStatus === 'pagos' ? v.pago : true
      return mesMatch && anoMatch && statusMatch
    })
    .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())

export const computeds = {
  categoriaFiltro: computed(() =>
    state.novaTransacao.tipo === 'Receita' ? state.categoriasReceita : state.categoriasDespesa,
  ),

  receitas: computed(() =>
    state.transacoes.reduce(
      (total: number, t) => (t.tipo === 'Receita' ? total + t.valor : total),
      0,
    ),
  ),

  despesas: computed(() =>
    state.transacoes.reduce(
      (total: number, t) => (t.tipo === 'Despesa' ? total + t.valor : total),
      0,
    ),
  ),

  anos: computed(() => {
    const anoAtual = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, i) => anoAtual - 2 + i)
  }),

  vencimentosFiltrados: computed(() => getVencimentosFiltrados()),

  totalAberto: computed<number>(() =>
    getVencimentosFiltrados()
      .filter((v) => !v.pago)
      .reduce((sum, v) => sum + (Number(v.valor) || 0), 0),
  ),

  totalPago: computed<number>(() =>
    getVencimentosFiltrados()
      .filter((v) => v.pago)
      .reduce((sum, v) => sum + (Number(v.valor) || 0), 0),
  ),

  totalGeral: computed<number>(() =>
    getVencimentosFiltrados().reduce((sum, v) => sum + (Number(v.valor) || 0), 0),
  ),
}

export const saldo: ComputedRef<number> = computed(
  () => computeds.receitas.value - computeds.despesas.value,
)

export function formatCurrency(value: number | string | null | undefined) {
  const num = Number(value) || 0
  const sign = num < 0 ? '-' : ''
  return (
    sign +
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      Math.abs(num),
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
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number(valor),
  )
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
    if (token) {
      const decoded: any = JSON.parse(atob(token.split('.')[1]))
      state.usuarioNome = decoded.nome || ''
      state.usuarioEmail = decoded.email || ''
      state.perfilForm.email = decoded.email
      state.usuarioFoto = localStorage.getItem('usuarioFoto') || ''
    }
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
      state.usuarioNome = response.usuario.nome || ''
      state.usuarioEmail = response.usuario.email || ''
      state.perfilForm.email = response.usuario.email
      if (response.usuario.foto_url) {
        state.usuarioFoto = response.usuario.foto_url
        localStorage.setItem('usuarioFoto', response.usuario.foto_url)
      }
      state.usuarioLogado = true
      window.location.reload()
    } catch (error: any) {
      state.erroLogin = error.response?.data?.error || 'Erro ao realizar login'
    } finally {
      state.loadingLogin = false
    }
  },

  async cadastro() {
    try {
      state.loadingCadastro = true
      state.erroCadastro = ''
      await testeService.cadastro({
        nome: state.cadastroForm.nome,
        email: state.cadastroForm.email,
        senha: state.cadastroForm.senha,
      })
      toast.success('Conta criada com sucesso! Faça login para continuar.')
      state.telaCadastro = false
      state.loginForm.email = state.cadastroForm.email
      state.loginForm.senha = state.cadastroForm.senha
      state.cadastroForm = { nome: '', email: '', senha: '' }
    } catch (error: any) {
      state.erroCadastro = error.response?.data?.error || 'Erro ao cadastrar'
    } finally {
      state.loadingCadastro = false
    }
  },

  async getDespesa() {
    try {
      const response = await testeService.getDespesa()
      state.despesa = Number(response?.total_despesas) || 0
    } catch {
      state.despesa = 0
    }
  },

  async getReceita() {
    try {
      const response = await testeService.getReceita()
      state.receita = Number(response?.total_receita) || 0
      state.saldo = state.receita - state.despesa
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
                      const value = context.parsed || 0
                      const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                      return `${context.label}: R$ ${formatCurrency(value)} (${((value / total) * 100).toFixed(1)}%)`
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
      toast.error(error?.message || 'Erro ao salvar transação')
    }
  },

  async getEstoque() {
    try {
      state.loadingEstoque = true
      const response = await testeService.getEstoque()
      state.compras = response || []
    } catch {
      toast.error('Erro ao carregar estoque')
    } finally {
      state.loadingEstoque = false
    }
  },

  async adicionarCompra() {
    try {
      const response = await testeService.insertEstoque({
        nome: state.novaCompra.nome,
        quantidade: state.novaCompra.quantidade,
        imagem: (state.novaCompra as any).imagem ?? null,
      })
      if (response?.success) {
        toast.success('Item adicionado ao estoque!')
        state.novaCompra = { nome: '', quantidade: 1 }
        await actions.getEstoque()
      } else {
        toast.error(response?.message || 'Erro ao adicionar item')
      }
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao adicionar item')
    }
  },

  async usarItem(i: number) {
    const item = state.compras[i]
    if (!item?.id || item.quantidade <= 0) return
    try {
      await testeService.usarItemEstoque(item.id)
      state.compras[i].quantidade -= 1
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao usar item')
    }
  },

  async aumentarItem(i: number) {
    const item = state.compras[i]
    if (!item?.id) return
    try {
      await testeService.aumentarItemEstoque(item.id, 1)
      state.compras[i].quantidade += 1
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao aumentar item')
    }
  },

  async deleteEstoque(i: number) {
    const item = state.compras[i]
    if (!item?.id) return
    try {
      await testeService.deleteEstoque(item.id)
      state.compras.splice(i, 1)
      toast.success('Item removido do estoque!')
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao remover item')
    }
  },

  mostrarMensagem(texto: string, cor: string) {
    state.snackbarText = texto
    state.snackbarColor = cor
    state.snackbar = true
  },

  async getVencimentos() {
    try {
      const response = await testeService.getVencimentos()
      state.vencimentos = (response || []).map((v: any) => ({
        ...v,
        pago: v.status === 'pago',
        lembretes: v.lembretes ? JSON.parse(v.lembretes) : [],
        dataVencimento: v.data?.substring(0, 10) ?? '',
        observacoes: v.observacao ?? '',
        emailNotificacao: v.email ?? '',
        enviarEmail: !!v.email,
        adicionarCalendario: false,
        recorrente: !!v.recorrente,
      }))
    } catch {
      toast.error('Erro ao carregar vencimentos')
    }
  },

  editarVencimento(vencimento: Vencimento) {
    state.modoEdicao = true
    state.vencimentoAtual = { ...vencimento }
    state.dialogCadastro = true
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

    const param = {
      id: v.id,
      descricao: v.descricao,
      categoria: v.categoria,
      valor: v.valor,
      data: v.dataVencimento,
      status: v.pago ? 'pago' : 'pendente',
      observacao: v.observacoes,
      email: v.enviarEmail ? v.emailNotificacao : null,
      recorrente: v.recorrente,
      lembretes: v.lembretes,
    }

    console.log('[salvarVencimento] param enviado ao banco:', param)
    console.log('[salvarVencimento] enviarEmail:', v.enviarEmail)
    console.log('[salvarVencimento] emailNotificacao:', v.emailNotificacao)
    console.log('[salvarVencimento] lembretes:', v.lembretes)

    try {
      if (state.modoEdicao) {
        await testeService.updateVencimento(param)
        actions.mostrarMensagem('Vencimento atualizado!', 'success')
      } else {
        await testeService.insertVencimento(param)
        actions.mostrarMensagem('Vencimento cadastrado!', 'success')
      }

      if (v.adicionarCalendario) {
        actions.adicionarAoGoogleCalendar(v)
      }

      console.log(
        '[salvarVencimento] vai chamar agendarEmailsLembrete?',
        v.enviarEmail && !!v.emailNotificacao && v.lembretes.length > 0,
      )

      if (v.enviarEmail && v.emailNotificacao && v.lembretes.length > 0) {
        await actions.agendarEmailsLembrete(v)
      }

      await actions.getVencimentos()
      actions.fecharDialog()
    } catch (err) {
      console.error('[salvarVencimento] erro:', err)
      actions.mostrarMensagem('Erro ao salvar vencimento', 'error')
    }
  },

  async agendarEmailsLembrete(vencimento: Vencimento) {
    console.log('[agendarEmailsLembrete] chamado com:', {
      email: vencimento.emailNotificacao,
      lembretes: vencimento.lembretes,
      descricao: vencimento.descricao,
    })

    if (!vencimento.emailNotificacao || vencimento.lembretes.length === 0) {
      console.warn('[agendarEmailsLembrete] Abortou: sem email ou sem lembretes')
      return
    }

    for (const diasAntes of vencimento.lembretes) {
      console.log(
        `[agendarEmailsLembrete] Enviando para ${vencimento.emailNotificacao} — ${diasAntes}d antes`,
      )
      try {
        await testeService.enviarEmailLembrete({
          email: vencimento.emailNotificacao,
          descricao: vencimento.descricao,
          valor: vencimento.valor,
          dataVencimento: vencimento.dataVencimento,
          categoria: vencimento.categoria,
          diasAntes,
        })
        console.log('[agendarEmailsLembrete] Email enviado com sucesso!')
      } catch (err: any) {
        console.error('[agendarEmailsLembrete] Erro:', err?.response?.data || err?.message || err)
      }
    }
  },

  async togglePagamento(vencimento: Vencimento) {
    if (!vencimento.id) return
    try {
      await testeService.togglePagamentoVencimento(vencimento.id as number)
      await actions.getVencimentos()
      actions.mostrarMensagem(
        vencimento.pago ? 'Pagamento desmarcado' : 'Pagamento registrado!',
        'success',
      )
    } catch {
      actions.mostrarMensagem('Erro ao atualizar pagamento', 'error')
    }
  },

  async excluirVencimento(vencimento: Vencimento) {
    if (!confirm('Deseja realmente excluir este vencimento?')) return
    try {
      await testeService.deleteVencimento(vencimento.id as number)
      actions.mostrarMensagem('Vencimento excluído!', 'success')
      await actions.getVencimentos()
    } catch {
      actions.mostrarMensagem('Erro ao excluir vencimento', 'error')
    }
  },

  adicionarAoGoogleCalendar(vencimento: Vencimento) {
    const dataVencimento = new Date(vencimento.dataVencimento)
    const lembretes = vencimento.lembretes.length > 0 ? vencimento.lembretes : [0]

    for (const diasAntes of lembretes) {
      const dataEvento = new Date(dataVencimento)
      dataEvento.setDate(dataEvento.getDate() - diasAntes)
      const dataFim = new Date(dataEvento.getTime() + 30 * 60000)

      const titulo =
        diasAntes === 0
          ? `Vencimento: ${vencimento.descricao}`
          : `Lembrete (${diasAntes}d): ${vencimento.descricao}`

      const detalhes = [
        `Categoria: ${vencimento.categoria}`,
        `Valor: ${formatarValor(vencimento.valor)}`,
        vencimento.observacoes ? `Obs: ${vencimento.observacoes}` : '',
      ]
        .filter(Boolean)
        .join('\n')

      const url =
        `https://www.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(titulo)}` +
        `&details=${encodeURIComponent(detalhes)}` +
        `&dates=${formatarDataCalendar(dataEvento)}/${formatarDataCalendar(dataFim)}`

      window.open(url, '_blank')
    }

    actions.mostrarMensagem('Evento(s) aberto(s) no Google Calendar!', 'success')
  },

  abrirPerfil() {
    state.perfilDialog.nomeLocal = state.usuarioNome
    state.perfilDialog.emailLocal = state.usuarioEmail
    state.dialogPerfil = true
  },

  async onFotoSelecionada(event: Event) {
    const input = event.target as HTMLInputElement
    if (!input.files?.length) return
    state.perfilDialog.loadingFoto = true
    try {
      const formData = new FormData()
      formData.append('foto', input.files[0])
      const response = await testeService.uploadFoto(formData)
      state.usuarioFoto = response.foto_url
      localStorage.setItem('usuarioFoto', response.foto_url)
      toast.success('Foto atualizada com sucesso!')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao enviar foto')
    } finally {
      state.perfilDialog.loadingFoto = false
    }
  },

  async salvarPerfil() {
    state.perfilDialog.erroPerfil = ''
    if (
      state.perfilDialog.novaSenha &&
      state.perfilDialog.novaSenha !== state.perfilDialog.confirmarSenha
    ) {
      state.perfilDialog.erroPerfil = 'As senhas não coincidem'
      return
    }
    state.perfilDialog.loadingSalvar = true
    try {
      await testeService.atualizarPerfil({
        nome: state.usuarioNome || state.perfilDialog.nomeLocal,
        email: state.usuarioEmail || state.perfilDialog.emailLocal,
        senhaAtual: state.perfilDialog.senhaAtual || undefined,
        novaSenha: state.perfilDialog.novaSenha || undefined,
      })
      if (!state.usuarioNome && state.perfilDialog.nomeLocal)
        state.usuarioNome = state.perfilDialog.nomeLocal
      if (!state.usuarioEmail && state.perfilDialog.emailLocal) {
        state.usuarioEmail = state.perfilDialog.emailLocal
        state.perfilForm.email = state.perfilDialog.emailLocal
      }
      state.perfilDialog.senhaAtual = ''
      state.perfilDialog.novaSenha = ''
      state.perfilDialog.confirmarSenha = ''
      state.dialogPerfil = false
      toast.success('Perfil atualizado com sucesso!')
    } catch (error: any) {
      state.perfilDialog.erroPerfil = error.response?.data?.error || 'Erro ao atualizar perfil'
    } finally {
      state.perfilDialog.loadingSalvar = false
    }
  },
}
