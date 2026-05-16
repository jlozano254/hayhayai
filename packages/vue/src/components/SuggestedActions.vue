<script setup lang="ts">
import type { SuggestedAction } from '@jlozano254/hayhayai-core'
import { useHayHay } from '../composables/useHayHay.js'

defineProps<{ actions: SuggestedAction[] }>()

const { executeAction } = useHayHay()
</script>

<template>
  <div v-if="actions.length" class="hh-suggested-actions">
    <button
      v-for="(sa, i) in actions"
      :key="i"
      class="hh-suggested-action-btn"
      @click="executeAction(sa.action.name, sa.action as Record<string, unknown>)"
    >
      {{ sa.label }}
    </button>
  </div>
</template>
