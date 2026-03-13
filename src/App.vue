<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'
import { state, actions, computeds, saldo } from './geral'
import Loguin from './loguin.vue'
import AppBar from './components/AppBar.vue'
import NavTabs from './components/NavTabs.vue'
import Dashboard from './components/Dashboard.vue'
import AdicionarTransacao from './components/AdicionarTransacao.vue'
import Transacoes from './components/Transacoes.vue'
import Estoque from './components/Estoque.vue'
import Vencimentos from './components/Vencimentos.vue'
import PerfilDialog from './components/PerfilDialog.vue'

onMounted(async () => {
  await actions.checkLogin()
  if (state.usuarioLogado) {
    await actions.getDespesa()
    await actions.getReceita()
    await actions.getMovimentacao()
    await actions.getEstoque()
    await actions.getVencimentos()
    await nextTick()
    await actions.atualizarGraficos()
  }
})

watch(
  () => state.abaSelecionada,
  async (newVal) => {
    if (newVal === 'dashboard') {
      await nextTick()
      await actions.atualizarGraficos()
    }
  },
)
</script>

<template>
  <Loguin v-if="!state.usuarioLogado" />
  <v-app v-else :theme="state.temaEscuro ? 'dark' : 'light'" class="app">
    <!-- Barra superior -->
    <AppBar
      :usuario-nome="state.usuarioNome"
      :usuario-foto="state.usuarioFoto"
      @logout="actions.logout"
      @abrir-perfil="state.dialogPerfil = true"
    />

    <!-- Abas de navegação -->
    <NavTabs
      :aba-selecionada="state.abaSelecionada"
      @update:aba-selecionada="state.abaSelecionada = $event"
    />

    <!-- Dialog de perfil -->
    <PerfilDialog
      v-model="state.dialogPerfil"
      :usuarioNome="state.usuarioNome"
      :usuarioEmail="state.perfilForm.email"
      :usuarioFoto="state.usuarioFoto"
      :nomeLocal="state.perfilDialog.nomeLocal"
      :emailLocal="state.perfilDialog.emailLocal"
      :senhaAtual="state.perfilDialog.senhaAtual"
      :novaSenha="state.perfilDialog.novaSenha"
      :confirmarSenha="state.perfilDialog.confirmarSenha"
      :loadingFoto="state.perfilDialog.loadingFoto"
      :loadingSalvar="state.perfilDialog.loadingSalvar"
      :erroPerfil="state.perfilDialog.erroPerfil"
      @fotoSelecionada="actions.onFotoSelecionada"
      @salvarPerfil="actions.salvarPerfil"
      @update:nomeLocal="state.perfilDialog.nomeLocal = $event"
      @update:emailLocal="state.perfilDialog.emailLocal = $event"
      @update:senhaAtual="state.perfilDialog.senhaAtual = $event"
      @update:novaSenha="state.perfilDialog.novaSenha = $event"
      @update:confirmarSenha="state.perfilDialog.confirmarSenha = $event"
    />

    <v-main>
      <v-container>
        <v-window v-model="state.abaSelecionada" class="mt-4 justify-center">
          <v-window-item value="dashboard">
            <Dashboard :receita="state.receita" :despesa="state.despesa" :saldo="state.saldo" />
          </v-window-item>

          <v-window-item value="adicionar">
            <AdicionarTransacao
              :nova-transacao="state.novaTransacao"
              :escolher-tipo="state.escolherTipo"
              :categoria-filtro="computeds.categoriaFiltro.value"
              @update:nova-transacao="state.novaTransacao = $event"
              @salvar="actions.salvarTransacao"
            />
          </v-window-item>

          <v-window-item value="transacoes">
            <Transacoes :transacoes="state.transacoes" :icones-categoria="state.iconesCategoria" />
          </v-window-item>

          <v-window-item value="compras">
            <Estoque
              :compras="state.compras"
              v-model:novaCompra="state.novaCompra"
              @adicionar="actions.adicionarCompra()"
              @usar-item="actions.usarItem($event)"
              @aumentar-item="actions.aumentarItem($event)"
              @deletar-item="actions.deleteEstoque($event)"
            />
          </v-window-item>

          <v-window-item value="vencimentos">
            <Vencimentos
              :vencimentos="computeds.vencimentosFiltrados.value"
              :vencimento-atual="state.vencimentoAtual"
              :dialog-cadastro="state.dialogCadastro"
              :modo-edicao="state.modoEdicao"
              :filtro-mes="state.filtroMes"
              :filtro-ano="state.filtroAno"
              :filtro-status="state.filtroStatus"
              :meses="state.meses"
              :anos="computeds.anos.value"
              :categorias="state.categorias"
              :snackbar="state.snackbar"
              :snackbar-text="state.snackbarText"
              :snackbar-color="state.snackbarColor"
              :total-aberto="computeds.totalAberto.value"
              :total-pago="computeds.totalPago.value"
              :total-geral="computeds.totalGeral.value"
              @update:dialog-cadastro="state.dialogCadastro = $event"
              @update:filtro-mes="state.filtroMes = $event"
              @update:filtro-ano="state.filtroAno = $event"
              @update:filtro-status="state.filtroStatus = $event"
              @update:vencimento-atual="state.vencimentoAtual = $event"
              @update:snackbar="state.snackbar = $event"
              @editar="actions.editarVencimento"
              @excluir="actions.excluirVencimento"
              @toggle-pagamento="actions.togglePagamento"
              @salvar="actions.salvarVencimento"
              @fechar="actions.fecharDialog"
            />
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.app {
  background-color: #0a0e27;
  background-image:
    radial-gradient(circle at 10% 20%, rgba(0, 212, 255, 0.05) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(0, 200, 83, 0.03) 0%, transparent 50%);
  background-attachment: fixed;
  min-height: 100vh;
}
</style>
