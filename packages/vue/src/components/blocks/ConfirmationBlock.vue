<script setup lang="ts">
import type { SuggestedAction } from '@jlozano254/hayhayai-core'

defineProps<{ message: string; title?: string; action?: SuggestedAction }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <div class="hh-block hh-block-confirmation">
    <p v-if="title" class="hh-block-title">{{ title }}</p>
    <p class="hh-block-content">{{ message }}</p>
    <div class="hh-block-confirmation-actions">
      <button class="hh-btn hh-btn-confirm" @click="emit('confirm')">Confirm</button>
      <button class="hh-btn hh-btn-cancel" @click="emit('cancel')">Cancel</button>
    </div>
  </div>
</template>
