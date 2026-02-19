import api from './api'
import { iParamInsert, LoginDTO } from './interface.js'

const caminho = '/pedidos'

export const login = async (payload: LoginDTO) => {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export const getDespesa = async () => {
  const { data } = await api.post(caminho, {
    call: 'getDespesa',
  })
  return data
}

export const getReceita = async () => {
  const { data } = await api.post(caminho, {
    call: 'getReceita',
  })
  return data
}

export const getMovimentacao = async () => {
  const { data } = await api.post(caminho, {
    call: 'getMovimentacao',
  })
  return data
}

export const insertMovimentacao = async (param: iParamInsert) => {
  const { data } = await api.post(caminho, {
    call: 'insertMovimentacao',
    param,
  })
  return data
}

export default {
  login,
  getDespesa,
  getReceita,
  insertMovimentacao,
  getMovimentacao,
}
