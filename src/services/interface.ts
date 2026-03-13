export interface iSeparador {
  cliente: string
  vendedor?: string
  num_nota?: number
}
export interface iParamInsert {
  valor: number
  descricao: string
  categoria: string
  tipo: string
}
export interface Transacao {
  id?: number
  data: string
  tipo: 'Receita' | 'Despesa'
  categoria: string
  descricao: string
  valor: number
}

export interface Compra {
  nome: string
  quantidade: number
}
export interface Vencimento {
  id: number | null
  descricao: string
  categoria: string
  valor: string | number
  dataVencimento: string
  lembretes: number[]
  observacoes: string
  pago: boolean
  recorrente: boolean
  enviarEmail: boolean
  emailNotificacao: string
  adicionarCalendario: boolean
}
export interface LoginDTO {
  email: string
  senha: string
}
export interface iEstoqueItem {
  nome: string
  categoria?: string
  quantidade: number
  imagem?: string | null
}

export interface iEstoqueUpdate {
  id: number
  nome?: string
  categoria?: string
  quantidade?: number
  imagem?: string | null
}
export interface Compra {
  id?: number
  nome: string
  quantidade: number
  imagem?: string | null
}
