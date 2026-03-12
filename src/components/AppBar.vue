<script setup lang="ts">
defineProps<{
  usuarioNome: string
  usuarioFoto: string
}>()

defineEmits<{
  (e: 'logout'): void
  (e: 'abrirPerfil'): void
}>()
</script>

<template>
  <v-app-bar class="app-bar-custom" elevation="0" fixed>
    <v-container class="d-flex align-center py-0">
      <v-toolbar-title class="text-gradient font-weight-bold d-flex align-center">
        <v-avatar size="55" class="logo-avatar">
          <v-icon size="30" color="#00ff88">mdi-chart-areaspline</v-icon>
        </v-avatar>
        Controle Financeiro Pessoal
      </v-toolbar-title>

      <v-spacer />

      <div
        class="d-flex align-center gap-2 mr-2"
        style="cursor: pointer"
        @click="$emit('abrirPerfil')"
      >
        <v-avatar size="36" style="border: 2px solid rgba(0, 255, 136, 0.4)" class="mr-2">
          <v-img v-if="usuarioFoto" :src="usuarioFoto" cover />
          <v-icon v-else size="20" color="#00ff88">mdi-account</v-icon>
        </v-avatar>
        <span style="color: #00ff88; font-size: 0.875rem; font-weight: 600">
          {{ usuarioNome }}
        </span>
      </div>

      <v-btn icon @click="$emit('logout')" color="#00ff88" variant="text">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-container>
  </v-app-bar>
</template>

<style>
.logo-avatar {
  background: rgba(0, 255, 136, 0.1) !important;
  border: 1px solid rgba(0, 255, 136, 0.2);
}
.v-toolbar.app-bar-custom {
  background: rgba(10, 14, 39, 0.7) !important;
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.text-gradient {
  color: #00ff88;
  font-weight: 800;
  letter-spacing: -0.5px;
}
</style>
