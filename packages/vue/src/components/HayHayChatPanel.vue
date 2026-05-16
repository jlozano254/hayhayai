<script setup lang="ts">
import { ref, inject } from 'vue'
import type { ChatBlock } from '@jlozano254/hayhayai-core'
import { useHayHay, type ChatMessage, hayHayConfigKey } from '../composables/useHayHay.js'
import SuggestedActions from './SuggestedActions.vue'
import TextBlock from './blocks/TextBlock.vue'
import ListBlock from './blocks/ListBlock.vue'
import StatusBlock from './blocks/StatusBlock.vue'
import ConfirmationBlock from './blocks/ConfirmationBlock.vue'
import ErrorBlock from './blocks/ErrorBlock.vue'

const { isOpen, isLoading, messages, close, send } = useHayHay()
const config = inject(hayHayConfigKey)

const inputText = ref('')
const isFullscreen = ref(false)

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return
  inputText.value = ''
  await send(text)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function sendQuickPrompt(text: string) {
  inputText.value = text
  handleSend()
}

function blockComponent(type: string) {
  const map: Record<string, unknown> = {
    text: TextBlock,
    'parsed-list': ListBlock,
    list: ListBlock,
    status: StatusBlock,
    confirmation: ConfirmationBlock,
    error: ErrorBlock,
  }
  return map[type] ?? TextBlock
}
</script>

<template>
  <Transition name="hh-panel">
    <div
      v-if="isOpen"
      class="hh-panel"
      :class="{ 'hh-panel--fullscreen': isFullscreen }"
      role="dialog"
      aria-label="AI Assistant"
      aria-modal="true"
    >
      <header class="hh-panel-header">
        <span class="hh-panel-title">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="opacity:.85"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>
          AI Assistant
        </span>
        <div class="hh-panel-actions">
          <button
            class="hh-panel-icon-btn"
            :aria-label="isFullscreen ? 'Exit fullscreen' : 'Expand to fullscreen'"
            :title="isFullscreen ? 'Exit fullscreen' : 'Expand'"
            @click="isFullscreen = !isFullscreen"
          >
            <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
          </button>
          <button class="hh-panel-icon-btn" aria-label="Close" title="Close" @click="close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </header>

      <div class="hh-panel-messages" ref="messagesEl">
        <!-- Empty state with quick prompts -->
        <div v-if="!(messages as ChatMessage[]).length && !isLoading" class="hh-empty-state">
          <div class="hh-empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>
          </div>
          <p class="hh-empty-hint">How can I help you today?</p>
          <div v-if="config?.quickPrompts?.length" class="hh-quick-prompts">
            <button
              v-for="(qp, i) in config.quickPrompts"
              :key="i"
              class="hh-quick-prompt-btn"
              @click="sendQuickPrompt(qp.text)"
            >
              <span v-if="qp.icon" class="hh-quick-prompt-icon">{{ qp.icon }}</span>
              {{ qp.label }}
            </button>
          </div>
        </div>

        <div
          v-for="msg in (messages as ChatMessage[])"
          :key="msg.id"
          class="hh-message"
          :data-role="msg.role"
        >
          <p class="hh-message-text">{{ msg.content }}</p>

          <template v-if="msg.role === 'assistant' && msg.reply">
            <component
              :is="blockComponent(block.type)"
              v-for="(block, i) in (msg.reply.blocks as ChatBlock[])"
              :key="i"
              v-bind="block"
            />
            <SuggestedActions
              v-if="msg.reply.suggestedActions?.length"
              :actions="msg.reply.suggestedActions"
            />
          </template>
        </div>

        <div v-if="isLoading" class="hh-message hh-message-loading" data-role="assistant">
          <span class="hh-loading-dot" /><span class="hh-loading-dot" /><span class="hh-loading-dot" />
        </div>
      </div>

      <footer class="hh-panel-footer">
        <textarea
          v-model="inputText"
          class="hh-input"
          placeholder="Ask me anything…"
          rows="2"
          :disabled="isLoading as boolean"
          @keydown="handleKeydown"
        />
        <button
          class="hh-send-btn"
          :disabled="!inputText.trim() || (isLoading as boolean)"
          @click="handleSend"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="m22 2-11 11M22 2 15 22l-4-9-9-4 20-7z"/></svg>
        </button>
      </footer>
    </div>
  </Transition>
</template>

<style scoped>
.hh-panel {
  position: fixed;
  bottom: 92px;
  right: 24px;
  z-index: 9999;
  width: 380px;
  max-height: 580px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  overflow: hidden;
  transition: width 0.25s ease, height 0.25s ease, bottom 0.25s ease, right 0.25s ease, border-radius 0.25s ease, max-height 0.25s ease;
}

.hh-panel--fullscreen {
  bottom: 0;
  right: 0;
  width: 100vw;
  max-height: 100dvh;
  height: 100dvh;
  border-radius: 0;
}

.hh-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  background: #f97316;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.hh-panel-title {
  display: flex;
  align-items: center;
  gap: 7px;
}

.hh-panel-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hh-panel-icon-btn {
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.85);
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.hh-panel-icon-btn:hover {
  background: rgba(255,255,255,0.2);
  color: #fff;
}

.hh-panel-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f9fafb;
}

/* Empty state */
.hh-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 8px 8px;
  gap: 12px;
}

.hh-empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fff7ed;
  color: #f97316;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hh-empty-hint {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

.hh-quick-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  width: 100%;
}

.hh-quick-prompt-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1.5px solid #f97316;
  color: #f97316;
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  font-family: inherit;
}

.hh-quick-prompt-btn:hover {
  background: #f97316;
  color: #fff;
}

.hh-quick-prompt-icon {
  font-size: 15px;
}

/* Messages */
.hh-message {
  max-width: 88%;
  padding: 10px 12px;
  border-radius: 12px;
  line-height: 1.5;
}

.hh-message[data-role="user"] {
  align-self: flex-end;
  background: #f97316;
  color: #fff;
  border-radius: 12px 12px 4px 12px;
}

.hh-message[data-role="assistant"] {
  align-self: flex-start;
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #111827;
  border-radius: 12px 12px 12px 4px;
}

.hh-message-text {
  margin: 0 0 4px;
}

.hh-message-loading {
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
}

.hh-loading-dot {
  width: 8px;
  height: 8px;
  background: #f97316;
  border-radius: 50%;
  animation: hh-bounce 1.2s infinite ease-in-out;
}

.hh-loading-dot:nth-child(2) { animation-delay: 0.2s; }
.hh-loading-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes hh-bounce {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* Footer */
.hh-panel-footer {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
  flex-shrink: 0;
}

.hh-input {
  flex: 1;
  resize: none;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
  line-height: 1.5;
}

.hh-input:focus {
  border-color: #f97316;
}

.hh-send-btn {
  background: #f97316;
  color: #fff;
  border: none;
  border-radius: 10px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}

.hh-send-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.hh-send-btn:not(:disabled):hover {
  background: #ea580c;
}

/* Transition */
.hh-panel-enter-active,
.hh-panel-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.hh-panel-enter-from,
.hh-panel-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}
</style>
