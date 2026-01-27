import axios from 'axios'

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
export const insertMovimentacao = async (param: {
  valor: number
  descricao: string
  categoria: string
  tipo: string
}) => {
  const { data } = await axios.post(caminho, {
    call: 'insertMovimentacao',
    param: {
      valor: param.valor,
      descricao: param.descricao,
      categoria: param.categoria,
      tipo: param.tipo,
    },
  })
  return data
}
export default {
  getDespesa,
  getReceita,
  insertMovimentacao,
}
