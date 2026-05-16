<script setup lang="ts">
import { useHayHay } from '../composables/useHayHay.js'

const { toggle, isOpen } = useHayHay()
</script>

<template>
  <button
    class="hh-launcher"
    :aria-label="isOpen ? 'Close AI assistant' : 'Open AI assistant'"
    :aria-expanded="String(isOpen)"
    @click="toggle"
  >
    <span class="hh-launcher-icon" aria-hidden="true">
      <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </span>
  </button>
</template>

<style scoped>
.hh-launcher {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9998;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f97316;
  color: #fff;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.15s;
}
.hh-launcher:hover {
  background: #ea580c;
  transform: scale(1.07);
}
.hh-launcher:focus-visible {
  outline: 3px solid #f97316;
  outline-offset: 3px;
}
</style>
