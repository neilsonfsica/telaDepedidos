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
