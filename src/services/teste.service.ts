import api from './api'
import { iParamInsert, LoginDTO } from './interface.js'

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

export default {
  login,
  cadastro,
  uploadFoto,
  atualizarPerfil,
  getDespesa,
  getReceita,
  insertMovimentacao,
  getMovimentacao,
}
