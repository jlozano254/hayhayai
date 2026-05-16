<script setup lang="ts">
defineProps<{ content?: string; title?: string }>()
</script>

<template>
  <div class="hh-block hh-block-error">
    <p v-if="title" class="hh-block-title">{{ title ?? 'Error' }}</p>
    <p class="hh-block-content">{{ content }}</p>
  </div>
</template>
