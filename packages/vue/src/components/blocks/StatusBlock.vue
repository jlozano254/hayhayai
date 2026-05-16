<script setup lang="ts">
defineProps<{ content?: string; title?: string; variant?: 'info' | 'success' | 'warning' | 'error' }>()
</script>

<template>
  <div class="hh-block hh-block-status" :data-variant="variant ?? 'info'">
    <p v-if="title" class="hh-block-title">{{ title }}</p>
    <p v-if="content" class="hh-block-content">{{ content }}</p>
  </div>
</template>
