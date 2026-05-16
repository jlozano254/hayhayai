<script setup lang="ts">
defineProps<{ items: string[]; title?: string }>()
</script>

<template>
  <div class="hh-block hh-block-list">
    <p v-if="title" class="hh-block-title">{{ title }}</p>
    <ul class="hh-block-list-items">
      <li v-for="(item, i) in items" :key="i">{{ item }}</li>
    </ul>
  </div>
</template>
