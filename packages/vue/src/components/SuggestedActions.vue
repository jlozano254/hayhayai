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
      @click="executeAction(sa.action.name, sa.action.params ?? {})"
    >
      {{ sa.label }}
    </button>
  </div>
</template>

<style>
.hh-suggested-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.hh-suggested-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: #fff7ed;
  color: #c2410c;
  border: 1.5px solid #fed7aa;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  font-family: system-ui, -apple-system, sans-serif;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  white-space: nowrap;
}

.hh-suggested-action-btn:hover {
  background: #f97316;
  border-color: #f97316;
  color: #fff;
}
</style>
