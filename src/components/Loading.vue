<script lang="ts" setup>
defineProps({
  loading: {
    type: Boolean,
    required: true,
  },
})
</script>

<template>
  <v-overlay class="align-center justify-center" :modelValue="loading" persistent>
    <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>
