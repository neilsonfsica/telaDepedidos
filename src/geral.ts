import { reactive, computed, ComputedRef, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import testeService from './services/teste.service.js'
import { Compra, Transacao, Vencimento } from './services/interface.js'
import toast from './plugins/toast.js'
import * as XLSX from 'xlsx'

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

  // Soma das transações individuais (usada internamente)
  receitas: computed(() =>
    state.transacoes.reduce(
      (total: number, t) => (t.tipo === 'Receita' ? total + Number(t.valor) : total),
      0,
    ),
  ),

  despesas: computed(() =>
    state.transacoes.reduce(
      (total: number, t) => (t.tipo === 'Despesa' ? total + Number(t.valor) : total),
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

// ✅ Saldo usa state.receita e state.despesa (valores da API)
// que são os mesmos valores exibidos nos cards de receita e despesa
export const saldo: ComputedRef<number> = computed(() => state.receita - state.despesa)

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

export function imprimirEstoque(compras: Compra[]) {
  const categoriaMap: Record<string, string> = {
    arroz: 'Grãos',
    feijão: 'Grãos',
    macarrão: 'Massas',
    café: 'Bebidas',
    leite: 'Bebidas',
    frango: 'Carnes',
    carne: 'Carnes',
    ovos: 'Laticínios',
    manteiga: 'Laticínios',
    pão: 'Padaria',
    farinha: 'Grãos',
    sal: 'Temperos',
    açúcar: 'Temperos',
    óleo: 'Óleos',
  }
  const findCategoria = (nome: string) => {
    const key = Object.keys(categoriaMap).find((k) => nome?.toLowerCase().includes(k))
    return key ? categoriaMap[key] : 'Geral'
  }

  const agora = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const totalUnid = compras.reduce((s, c) => s + (c.quantidade || 0), 0)
  const emBaixa = compras.filter((c) => c.quantidade <= 5).length
  const criticos = compras.filter((c) => c.quantidade <= 1).length

  const linhas = compras
    .slice()
    .sort((a, b) => a.quantidade - b.quantidade)
    .map((c) => {
      const status = c.quantidade <= 1 ? '🔴 CRÍTICO' : c.quantidade <= 5 ? '🟡 BAIXO' : '🟢 OK'
      return `
        <tr>
          <td>${c.nome.charAt(0).toUpperCase() + c.nome.slice(1)}</td>
          <td>${findCategoria(c.nome)}</td>
          <td style="font-weight:700;color:${c.quantidade <= 1 ? '#dc2626' : c.quantidade <= 5 ? '#d97706' : '#16a34a'}">
            ${c.quantidade} unid.
          </td>
          <td>${status}</td>
        </tr>`
    })
    .join('')

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
    <title>Relatório de Estoque</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;padding:32px}
      .header{border-bottom:3px solid #1a6fff;padding-bottom:16px;margin-bottom:24px}
      .header h1{font-size:24px;font-weight:800;color:#1a6fff}
      .header p{font-size:13px;color:#666;margin-top:4px}
      .summary{display:flex;gap:16px;margin-bottom:24px}
      .sum-card{flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px}
      .sum-card .val{font-size:22px;font-weight:800}
      .sum-card .lbl{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.06em;margin-top:2px}
      .sum-card--blue .val{color:#1a6fff}
      .sum-card--green .val{color:#16a34a}
      .sum-card--amber .val{color:#d97706}
      .sum-card--red .val{color:#dc2626}
      table{width:100%;border-collapse:collapse}
      thead tr{background:#f3f4f6}
      th{text-align:left;padding:10px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#555;border-bottom:2px solid #e5e7eb}
      td{padding:10px 14px;font-size:13px;border-bottom:1px solid #f3f4f6}
      tr:last-child td{border-bottom:none}
      tr:nth-child(even){background:#fafafa}
      .footer{margin-top:32px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:11px;color:#aaa;display:flex;justify-content:space-between}
    </style></head><body>
    <div class="header">
      <h1>📦 Relatório de Estoque</h1>
      <p>Gerado em ${agora} · ${compras.length} produtos cadastrados</p>
    </div>
    <div class="summary">
      <div class="sum-card sum-card--blue"><div class="val">${compras.length}</div><div class="lbl">Total de produtos</div></div>
      <div class="sum-card sum-card--green"><div class="val">${totalUnid}</div><div class="lbl">Unidades em estoque</div></div>
      <div class="sum-card sum-card--amber"><div class="val">${emBaixa}</div><div class="lbl">Itens em baixa (≤5)</div></div>
      <div class="sum-card sum-card--red"><div class="val">${criticos}</div><div class="lbl">Itens críticos (≤1)</div></div>
    </div>
    <table>
      <thead><tr><th>Produto</th><th>Categoria</th><th>Quantidade</th><th>Status</th></tr></thead>
      <tbody>${linhas}</tbody>
    </table>
    <div class="footer">
      <span>Controle Financeiro Pessoal — Gestão de Estoque</span>
      <span>${agora}</span>
    </div>
    </body></html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 400)
}

export function gerarExcelEstoque(compras: Compra[]) {
  const categoriaMap: Record<string, string> = {
    arroz: 'Grãos',
    feijão: 'Grãos',
    macarrão: 'Massas',
    café: 'Bebidas',
    leite: 'Bebidas',
    frango: 'Carnes',
    carne: 'Carnes',
    ovos: 'Laticínios',
    manteiga: 'Laticínios',
    pão: 'Padaria',
    farinha: 'Grãos',
    sal: 'Temperos',
    açúcar: 'Temperos',
    óleo: 'Óleos',
  }
  const findCategoria = (nome: string) => {
    const key = Object.keys(categoriaMap).find((k) => nome?.toLowerCase().includes(k))
    return key ? categoriaMap[key] : 'Geral'
  }
  const getStatus = (qty: number) => (qty <= 1 ? 'CRÍTICO' : qty <= 5 ? 'BAIXO' : 'OK')

  const agora = new Date()
  const dataStr = agora.toLocaleDateString('pt-BR')
  const horaStr = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const totalUnid = compras.reduce((s, c) => s + (c.quantidade || 0), 0)
  const emBaixa = compras.filter((c) => c.quantidade <= 5 && c.quantidade > 1).length
  const criticos = compras.filter((c) => c.quantidade <= 1).length
  const ok = compras.filter((c) => c.quantidade > 5).length

  const wb = XLSX.utils.book_new()

  // ── Aba 1: Lista completa ──────────────────────────────────────────
  const dadosLista = [
    ['RELATÓRIO DE ESTOQUE', '', '', '', ''],
    [`Gerado em: ${dataStr} às ${horaStr}`, '', '', '', ''],
    ['', '', '', '', ''],
    ['PRODUTO', 'CATEGORIA', 'QUANTIDADE', 'STATUS', 'OBSERVAÇÃO'],
    ...compras
      .slice()
      .sort((a, b) => a.quantidade - b.quantidade)
      .map((c) => [
        c.nome.charAt(0).toUpperCase() + c.nome.slice(1),
        findCategoria(c.nome),
        c.quantidade,
        getStatus(c.quantidade),
        c.quantidade <= 1 ? 'Repor imediatamente!' : c.quantidade <= 5 ? 'Repor em breve' : '',
      ]),
    ['', '', '', '', ''],
    ['TOTAIS', '', '', '', ''],
    ['Total de produtos', compras.length, '', '', ''],
    ['Total de unidades', totalUnid, '', '', ''],
    ['Itens OK (>5)', ok, '', '', ''],
    ['Itens em baixa (2-5)', emBaixa, '', '', ''],
    ['Itens críticos (≤1)', criticos, '', '', ''],
  ]

  const ws1 = XLSX.utils.aoa_to_sheet(dadosLista)

  ws1['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 24 }]

  ws1['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
  ]

  XLSX.utils.book_append_sheet(wb, ws1, 'Estoque Completo')

  // ── Aba 2: Itens em baixa ──────────────────────────────────────────
  const baixos = compras
    .filter((c) => c.quantidade <= 5)
    .sort((a, b) => a.quantidade - b.quantidade)

  const dadosBaixos = [
    ['ITENS QUE PRECISAM DE REPOSIÇÃO', '', '', ''],
    [`Gerado em: ${dataStr} às ${horaStr}`, '', '', ''],
    ['', '', '', ''],
    ['PRODUTO', 'CATEGORIA', 'QUANTIDADE ATUAL', 'PRIORIDADE'],
    ...baixos.map((c) => [
      c.nome.charAt(0).toUpperCase() + c.nome.slice(1),
      findCategoria(c.nome),
      c.quantidade,
      c.quantidade <= 1 ? '🔴 URGENTE' : '🟡 MODERADA',
    ]),
    ...(baixos.length === 0 ? [['Nenhum item em baixa no momento', '', '', '']] : []),
  ]

  const ws2 = XLSX.utils.aoa_to_sheet(dadosBaixos)
  ws2['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 18 }, { wch: 16 }]
  ws2['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
  ]

  XLSX.utils.book_append_sheet(wb, ws2, 'Reposição Necessária')

  // ── Aba 3: Resumo por categoria ────────────────────────────────────
  const porCategoria: Record<string, { total: number; unidades: number }> = {}
  compras.forEach((c) => {
    const cat = findCategoria(c.nome)
    if (!porCategoria[cat]) porCategoria[cat] = { total: 0, unidades: 0 }
    porCategoria[cat].total += 1
    porCategoria[cat].unidades += c.quantidade
  })

  const dadosCategoria = [
    ['RESUMO POR CATEGORIA', '', ''],
    [`Gerado em: ${dataStr} às ${horaStr}`, '', ''],
    ['', '', ''],
    ['CATEGORIA', 'QTD DE PRODUTOS', 'TOTAL DE UNIDADES'],
    ...Object.entries(porCategoria)
      .sort((a, b) => b[1].unidades - a[1].unidades)
      .map(([cat, dados]) => [cat, dados.total, dados.unidades]),
    ['', '', ''],
    ['TOTAL GERAL', compras.length, totalUnid],
  ]

  const ws3 = XLSX.utils.aoa_to_sheet(dadosCategoria)
  ws3['!cols'] = [{ wch: 22 }, { wch: 18 }, { wch: 20 }]
  ws3['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
  ]

  XLSX.utils.book_append_sheet(wb, ws3, 'Por Categoria')

  const nomeArquivo = `estoque_${agora.toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, nomeArquivo)
  toast.success('Excel gerado com sucesso!')
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
      // ✅ Atualiza state.saldo junto para manter consistência
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

    const receita = state.receita
    const despesa = state.despesa
    const maxVal = Math.max(receita, despesa, 1)

    // ── Gráfico de barras ──
    const canvas = document.getElementById('grafico') as HTMLCanvasElement | null
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Destrói qualquer instância existente no canvas (inclusive a do Dashboard.vue)
        const existing = Chart.getChart(canvas)
        if (existing) existing.destroy()
        state.chart?.destroy()
        state.chart = null

        state.chart = new Chart<'bar', number[], string>(ctx, {
          type: 'bar',
          data: {
            labels: ['Receitas', 'Despesas'],
            datasets: [
              {
                label: 'Valores em R$',
                data: [receita, despesa],
                backgroundColor: ['rgba(74, 222, 128, 0.7)', 'rgba(248, 113, 113, 0.7)'],
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
                callbacks: {
                  label: (ctx) => ` R$ ${formatCurrency(ctx.parsed.y)}`,
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: {
                  color: 'rgba(255,255,255,0.4)',
                  font: { weight: 'bold', size: 13 },
                },
                border: { display: false },
              },
              y: {
                min: 0,
                max: Math.ceil(maxVal * 1.25),
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: {
                  color: 'rgba(255,255,255,0.3)',
                  font: { size: 11 },
                  callback: (v) => `R$ ${formatCurrency(Number(v))}`,
                },
                border: { display: false },
              },
            },
          },
        })
      }
    }

    // ── Gráfico de pizza ──
    const despesasPorCategoria: Record<string, number> = {}
    state.transacoes
      .filter((t) => t.tipo === 'Despesa')
      .forEach((t) => {
        despesasPorCategoria[t.categoria] =
          (despesasPorCategoria[t.categoria] || 0) + Number(t.valor)
      })

    const canvasCat = document.getElementById('graficoCategoria') as HTMLCanvasElement | null
    if (canvasCat) {
      const ctxCat = canvasCat.getContext('2d')
      if (ctxCat) {
        // Destrói qualquer instância existente no canvas (inclusive a do Dashboard.vue)
        const existingCat = Chart.getChart(canvasCat)
        if (existingCat) existingCat.destroy()
        state.chartCategoria?.destroy()
        state.chartCategoria = null

        const categoriasList = Object.keys(despesasPorCategoria)
        const valores = Object.values(despesasPorCategoria)

        if (categoriasList.length > 0 && valores.some((v) => v > 0)) {
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

          state.chartCategoria = new Chart<'pie', number[], string>(ctxCat, {
            type: 'pie',
            data: {
              labels: categoriasList,
              datasets: [
                {
                  data: valores,
                  backgroundColor: categoriasList.map((c) => (cores[c] || '#6b7280') + 'cc'),
                  borderColor: categoriasList.map((c) => cores[c] || '#6b7280'),
                  borderWidth: 2,
                  hoverOffset: 12,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    boxWidth: 12,
                    boxHeight: 12,
                    borderRadius: 4,
                    padding: 16,
                    color: 'rgba(255,255,255,0.6)',
                    font: { size: 12 },
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
                    label: (context) => {
                      const value = context.parsed || 0
                      const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                      return ` R$ ${formatCurrency(value)}  (${((value / total) * 100).toFixed(1)}%)`
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
    if (!vencimento.emailNotificacao || vencimento.lembretes.length === 0) return

    for (const diasAntes of vencimento.lembretes) {
      try {
        await testeService.enviarEmailLembrete({
          email: vencimento.emailNotificacao,
          descricao: vencimento.descricao,
          valor: vencimento.valor,
          dataVencimento: vencimento.dataVencimento,
          categoria: vencimento.categoria,
          diasAntes,
        })
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
