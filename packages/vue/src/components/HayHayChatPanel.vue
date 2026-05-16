<script setup lang="ts">
import { ref } from 'vue'
import type { ChatBlock } from '@jlozano254/hayhayai-core'
import { useHayHay, type ChatMessage } from '../composables/useHayHay.js'
import SuggestedActions from './SuggestedActions.vue'
import TextBlock from './blocks/TextBlock.vue'
import ListBlock from './blocks/ListBlock.vue'
import StatusBlock from './blocks/StatusBlock.vue'
import ConfirmationBlock from './blocks/ConfirmationBlock.vue'
import ErrorBlock from './blocks/ErrorBlock.vue'

const { isOpen, isLoading, messages, close, send } = useHayHay()

const inputText = ref('')

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
    <div v-if="isOpen" class="hh-panel" role="dialog" aria-label="AI Assistant" aria-modal="true">
      <header class="hh-panel-header">
        <span class="hh-panel-title">AI Assistant</span>
        <button class="hh-panel-close" aria-label="Close" @click="close">✕</button>
      </header>

      <div class="hh-panel-messages">
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
          Send
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
  width: 360px;
  max-height: 560px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
  font-family: system-ui, sans-serif;
  font-size: 14px;
  overflow: hidden;
}

.hh-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #f97316;
  color: #fff;
  font-weight: 600;
  font-size: 15px;
}

.hh-panel-close {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0 4px;
}

.hh-panel-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f9fafb;
}

.hh-message {
  max-width: 92%;
  padding: 10px 12px;
  border-radius: 10px;
  line-height: 1.5;
}

.hh-message[data-role="user"] {
  align-self: flex-end;
  background: #f97316;
  color: #fff;
}

.hh-message[data-role="assistant"] {
  align-self: flex-start;
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #111827;
}

.hh-message-text {
  margin: 0 0 6px;
}

.hh-message-loading {
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 12px;
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

.hh-panel-footer {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

.hh-input {
  flex: 1;
  resize: none;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.hh-input:focus {
  border-color: #f97316;
}

.hh-send-btn {
  background: #f97316;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0 16px;
  font-weight: 600;
  cursor: pointer;
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
