export { createHayHayPlugin } from './plugin/index.js'
export { useHayHay, hayHayRuntimeKey } from './composables/useHayHay.js'
export { useInertiaRescan } from './composables/useInertiaRescan.js'

export { default as HayHayLauncher } from './components/HayHayLauncher.vue'
export { default as HayHayChatPanel } from './components/HayHayChatPanel.vue'
export { default as SuggestedActions } from './components/SuggestedActions.vue'
export { default as TextBlock } from './components/blocks/TextBlock.vue'
export { default as ListBlock } from './components/blocks/ListBlock.vue'
export { default as StatusBlock } from './components/blocks/StatusBlock.vue'
export { default as ConfirmationBlock } from './components/blocks/ConfirmationBlock.vue'
export { default as ErrorBlock } from './components/blocks/ErrorBlock.vue'

export type { HayHayComposable, ChatMessage } from './composables/useHayHay.js'
