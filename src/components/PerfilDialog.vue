<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  usuarioNome: String,
  usuarioEmail: String,
  usuarioFoto: String,

  nomeLocal: String,
  emailLocal: String,

  senhaAtual: String,
  novaSenha: String,
  confirmarSenha: String,

  loadingFoto: Boolean,
  loadingSalvar: Boolean,
  erroPerfil: String,
})

const emit = defineEmits([
  'update:modelValue',
  'update:nomeLocal',
  'update:emailLocal',
  'update:senhaAtual',
  'update:novaSenha',
  'update:confirmarSenha',
  'fotoSelecionada',
  'salvarPerfil',
])

const fileInput = ref<HTMLInputElement | null>(null)

const abrirSeletorFoto = () => {
  fileInput.value?.click()
}

const onFotoSelecionada = (event: Event) => {
  emit('fotoSelecionada', event)
}

const handleSalvarPerfil = () => {
  emit('salvarPerfil', {
    atualizarNome: !props.usuarioNome,
    atualizarEmail: !props.usuarioEmail,
  })
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    max-width="500px"
    persistent
  >
    <v-card class="perfil-card">
      <v-card-title class="pa-6 pb-4 d-flex align-center justify-space-between">
        <span class="text-h5 font-weight-bold" style="color: #00ff88"> Meu Perfil </span>

        <v-btn icon variant="text" @click="emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider style="border-color: rgba(255, 255, 255, 0.08)" />

      <v-card-text class="pa-6">
        <div class="d-flex flex-column align-center mb-6">
          <v-avatar
            size="100"
            style="border: 3px solid rgba(0, 255, 136, 0.4); cursor: pointer"
            @click="abrirSeletorFoto"
          >
            <v-img v-if="usuarioFoto" :src="usuarioFoto" cover />

            <v-icon v-else size="48" color="#00ff88"> mdi-account </v-icon>

            <div class="foto-overlay">
              <v-icon color="white" size="24"> mdi-camera </v-icon>
            </div>
          </v-avatar>

          <v-btn
            size="small"
            variant="text"
            color="#00ff88"
            class="mt-2"
            :loading="loadingFoto"
            @click="abrirSeletorFoto"
          >
            <v-icon start size="16">mdi-upload</v-icon>
            Alterar foto
          </v-btn>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="onFotoSelecionada"
          />
        </div>

        <v-divider class="mb-4" style="border-color: rgba(255, 255, 255, 0.08)" />

        <p class="text-caption text-grey mb-3">DADOS PESSOAIS</p>
        <v-text-field
          v-if="!usuarioNome"
          :model-value="nomeLocal"
          @update:model-value="emit('update:nomeLocal', $event)"
          label="Nome"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-account-outline"
          class="mb-3 perfil-field"
          hide-details
        />

        <v-text-field
          v-else
          :model-value="usuarioNome"
          label="Nome"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-account-outline"
          class="mb-3 perfil-field"
          readonly
          hide-details
        />
        <v-text-field
          v-if="!usuarioEmail"
          :model-value="emailLocal"
          @update:model-value="emit('update:emailLocal', $event)"
          label="Email"
          type="email"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-email-outline"
          class="mb-4 perfil-field"
          hide-details
        />

        <v-text-field
          v-else
          :model-value="usuarioEmail"
          label="Email"
          type="email"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-email-outline"
          class="mb-4 perfil-field"
          readonly
          hide-details
        />

        <v-divider class="mb-4" style="border-color: rgba(255, 255, 255, 0.08)" />

        <p class="text-caption text-grey mb-3">
          ALTERAR SENHA
          <span class="text-grey">(opcional)</span>
        </p>

        <v-text-field
          :model-value="senhaAtual"
          @update:model-value="emit('update:senhaAtual', $event)"
          label="Senha atual"
          type="password"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-lock-outline"
          class="mb-3 perfil-field"
          hide-details
        />

        <v-text-field
          :model-value="novaSenha"
          @update:model-value="emit('update:novaSenha', $event)"
          label="Nova senha"
          type="password"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-lock-reset"
          class="mb-3 perfil-field"
          hide-details
        />

        <v-text-field
          :model-value="confirmarSenha"
          @update:model-value="emit('update:confirmarSenha', $event)"
          label="Confirmar nova senha"
          type="password"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-lock-check-outline"
          class="mb-4 perfil-field"
          hide-details
        />

        <v-alert
          v-if="erroPerfil"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4"
          :text="erroPerfil"
        />
      </v-card-text>

      <v-divider style="border-color: rgba(255, 255, 255, 0.08)" />

      <v-card-actions class="pa-6 pt-4">
        <v-spacer />

        <v-btn color="grey" variant="text" size="large" @click="emit('update:modelValue', false)">
          Cancelar
        </v-btn>

        <v-btn
          class="btn-salvar"
          variant="flat"
          size="large"
          :loading="loadingSalvar"
          @click="handleSalvarPerfil"
        >
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.perfil-card {
  background: #0f1229 !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 20px !important;
}

.perfil-field :deep(.v-field) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-radius: 10px;
}

.btn-salvar {
  background: linear-gradient(135deg, #00ff88, #00c4ff) !important;
  color: #0a0e27 !important;
  font-weight: 700 !important;
  border-radius: 10px !important;
}

.v-avatar {
  position: relative;
  overflow: hidden;
}

.foto-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.v-avatar:hover .foto-overlay {
  opacity: 1;
}
</style>
