import axios from 'axios'
import { iParamInsert } from './interface.js'

const caminho = `${import.meta.env.VITE_API_URL}/pedidos`

export const getDespesa = async () => {
  const { data } = await axios.post(caminho, {
    call: 'getDespesa',
  })
  return data
}
export const getReceita = async () => {
  const { data } = await axios.post(caminho, {
    call: 'getReceita',
  })
  return data
}
export const getMovimentacao = async () => {
  const { data } = await axios.post(caminho, {
    call: 'getMovimentacao',
  })
  return data
}

export const insertMovimentacao = async (param: iParamInsert) => {
  const { data } = await axios.post(caminho, {
    call: 'insertMovimentacao',
    param: param,
  })
  return data
}
export default {
  getDespesa,
  getReceita,
  insertMovimentacao,
  getMovimentacao,
}
