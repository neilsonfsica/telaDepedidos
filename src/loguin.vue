<script setup lang="ts">
import { state, actions } from './geral'
</script>

<template>
  <v-app style="background-color: #0a0e27">
    <v-container class="fill-height d-flex align-center justify-center">
      <v-card width="420" class="login-card pa-2" elevation="0">
        <!-- Header -->
        <v-card-text class="text-center pb-4 pt-8">
          <v-avatar size="64" class="logo-avatar mb-4">
            <v-icon size="32" color="#00ff88">mdi-chart-areaspline</v-icon>
          </v-avatar>
          <h1 class="login-title">Controle Financeiro</h1>
          <p class="login-sub">Acesse sua conta</p>
        </v-card-text>

        <v-divider style="border-color: rgba(255, 255, 255, 0.06)" />

        <!-- Form -->
        <v-card-text class="px-8 pt-6 pb-8">
          <v-text-field
            v-model="state.loginForm.email"
            label="Email"
            type="email"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-email-outline"
            placeholder="seu@email.com"
            class="mb-2 login-field"
            hide-details
          />

          <v-text-field
            v-model="state.loginForm.senha"
            label="Senha"
            type="password"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-lock-outline"
            placeholder="••••••••"
            class="mb-4 login-field"
            hide-details
            @keyup.enter="actions.login"
          />

          <v-alert
            v-if="state.erroLogin"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-4"
            :text="state.erroLogin"
          />

          <v-btn
            block
            size="large"
            :loading="state.loadingLogin"
            class="btn-login"
            @click="actions.login"
          >
            Entrar
          </v-btn>
        </v-card-text>
      </v-card>
    </v-container>
  </v-app>
</template>

<style scoped>
.login-card {
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 20px !important;
  backdrop-filter: blur(20px);
}

.logo-avatar {
  background: rgba(0, 255, 136, 0.1) !important;
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.login-title {
  color: #00ff88;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.3px;
  margin-bottom: 4px;
}

.login-sub {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.login-field :deep(.v-field) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-radius: 10px;
}

.login-field :deep(.v-field__outline__start),
.login-field :deep(.v-field__outline__end),
.login-field :deep(.v-field__outline__notch) {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.login-field :deep(.v-field--focused .v-field__outline__start),
.login-field :deep(.v-field--focused .v-field__outline__end),
.login-field :deep(.v-field--focused .v-field__outline__notch) {
  border-color: rgba(0, 255, 136, 0.5) !important;
}

.btn-login {
  background: linear-gradient(135deg, #00ff88, #00c4ff) !important;
  color: #0a0e27 !important;
  font-weight: 700 !important;
  letter-spacing: 0.5px;
  border-radius: 10px !important;
}
</style>
