<script setup lang="ts">
import { inject, computed, type Component } from 'vue'
import { hayHayConfigKey } from '../../composables/useHayHay.js'

const props = defineProps<{
  component: string
  items: Record<string, unknown>[]
  title?: string
}>()

const config = inject(hayHayConfigKey)

const resolvedComponent = computed((): Component | null => {
  if (!config?.blockComponents) return null
  return (config.blockComponents as Record<string, Component>)[props.component] ?? null
})
</script>

<template>
  <div class="hh-item-list">
    <p v-if="title" class="hh-item-list-title">{{ title }}</p>
    <div v-if="resolvedComponent" class="hh-item-list-scroll">
      <component
        v-for="(item, i) in items"
        :key="(item.id as string) || i"
        :is="resolvedComponent"
        v-bind="item"
      />
    </div>
    <p v-else class="hh-item-list-fallback">{{ items.length }} result{{ items.length !== 1 ? 's' : '' }} found.</p>
  </div>
</template>

<style>
.hh-item-list {
  width: 100%;
  margin: 2px 0;
}

.hh-item-list-title {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.hh-item-list-scroll {
  display: flex;
  flex-direction: row;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 6px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.hh-item-list-scroll > * {
  scroll-snap-align: start;
  flex-shrink: 0;
}

.hh-item-list-scroll::-webkit-scrollbar {
  height: 4px;
}

.hh-item-list-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.hh-item-list-scroll::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 999px;
}

.hh-item-list-fallback {
  color: #6b7280;
  font-size: 13px;
  margin: 0;
}
</style>
