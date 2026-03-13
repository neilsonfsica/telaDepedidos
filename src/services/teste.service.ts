import api from './api'
import { iParamInsert, LoginDTO, iEstoqueItem, iEstoqueUpdate } from './interface.js'

const caminho = '/pedidos'

export const login = async (payload: LoginDTO) => {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export const cadastro = async (payload: { nome: string; email: string; senha: string }) => {
  const { data } = await api.post('/auth/cadastro', payload)
  return data
}

export const uploadFoto = async (formData: FormData) => {
  const { data } = await api.post('/auth/foto-perfil', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const atualizarPerfil = async (payload: {
  nome: string
  email: string
  senhaAtual?: string
  novaSenha?: string
}) => {
  const { data } = await api.put('/auth/perfil', payload)
  return data
}

export const getDespesa = async () => {
  const { data } = await api.post(caminho, { call: 'getDespesa' })
  return data
}

export const getReceita = async () => {
  const { data } = await api.post(caminho, { call: 'getReceita' })
  return data
}

export const getMovimentacao = async () => {
  const { data } = await api.post(caminho, { call: 'getMovimentacao' })
  return data
}

export const insertMovimentacao = async (param: iParamInsert) => {
  const { data } = await api.post(caminho, { call: 'insertMovimentacao', param })
  return data
}

export const getEstoque = async () => {
  const { data } = await api.post(caminho, { call: 'getEstoque' })
  return data
}

export const insertEstoque = async (param: iEstoqueItem) => {
  const { data } = await api.post(caminho, { call: 'insertEstoque', param })
  return data
}

export const updateEstoque = async (param: iEstoqueUpdate) => {
  const { data } = await api.post(caminho, { call: 'updateEstoque', param })
  return data
}

export const usarItemEstoque = async (id: number) => {
  const { data } = await api.post(caminho, { call: 'usarItemEstoque', param: { id } })
  return data
}

export const aumentarItemEstoque = async (id: number, quantidade: number = 1) => {
  const { data } = await api.post(caminho, {
    call: 'aumentarItemEstoque',
    param: { id, quantidade },
  })
  return data
}

export const deleteEstoque = async (id: number) => {
  const { data } = await api.post(caminho, { call: 'deleteEstoque', param: { id } })
  return data
}

export const getVencimentos = async () => {
  const { data } = await api.post(caminho, { call: 'getVencimentos' })
  return data
}

export const insertVencimento = async (param: any) => {
  const { data } = await api.post(caminho, { call: 'insertVencimento', param })
  return data
}

export const updateVencimento = async (param: any) => {
  const { data } = await api.post(caminho, { call: 'updateVencimento', param })
  return data
}

export const togglePagamentoVencimento = async (id: number) => {
  const { data } = await api.post(caminho, { call: 'togglePagamentoVencimento', param: { id } })
  return data
}

export const deleteVencimento = async (id: number) => {
  const { data } = await api.post(caminho, { call: 'deleteVencimento', param: { id } })
  return data
}

export const enviarEmailLembrete = async (param: {
  email: string
  descricao: string
  valor: string | number
  dataVencimento: string
  categoria: string
  diasAntes: number
}) => {
  console.log('[service] chamando enviarEmailLembrete:', param)
  const { data } = await api.post(caminho, { call: 'enviarEmailLembrete', param })
  console.log('[service] resposta:', data)
  return data
}
export default {
  login,
  cadastro,
  uploadFoto,
  atualizarPerfil,
  getDespesa,
  getReceita,
  insertMovimentacao,
  getMovimentacao,
  getEstoque,
  insertEstoque,
  updateEstoque,
  usarItemEstoque,
  aumentarItemEstoque,
  deleteEstoque,
  getVencimentos,
  insertVencimento,
  updateVencimento,
  togglePagamentoVencimento,
  deleteVencimento,
  enviarEmailLembrete,
}
