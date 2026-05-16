import { inject, ref, readonly, type InjectionKey } from 'vue'
import { type HayHayRuntime, type HHActionOptions, type AssistantReply, type HHMessage, type HayHayConfig } from '@jlozano254/hayhayai-core'

export const hayHayRuntimeKey: InjectionKey<HayHayRuntime> = Symbol('hayhayai-runtime')
export const hayHayConfigKey: InjectionKey<HayHayConfig> = Symbol('hayhayai-config')

export interface HayHayComposable {
  isOpen: ReturnType<typeof readonly>
  isLoading: ReturnType<typeof readonly>
  messages: ReturnType<typeof readonly>
  open: () => void
  close: () => void
  toggle: () => void
  send: (message: string) => Promise<AssistantReply | null>
  registerAction: (
    name: string,
    handler: (params: Record<string, unknown>) => Promise<unknown>,
    options?: HHActionOptions,
  ) => void
  executeAction: (name: string, params?: Record<string, unknown>) => Promise<unknown>
  clearSession: () => void
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  reply?: AssistantReply
  timestamp: number
}

const isOpenRef = ref(false)
const isLoadingRef = ref(false)
const messagesRef = ref<ChatMessage[]>([])

export function useHayHay(): HayHayComposable {
  const runtime = inject(hayHayRuntimeKey)

  if (!runtime) {
    throw new Error('[hayhayai] useHayHay() must be called inside a component tree where HayHayAI plugin is installed.')
  }

  function open() {
    isOpenRef.value = true
  }

  function close() {
    isOpenRef.value = false
  }

  function toggle() {
    isOpenRef.value = !isOpenRef.value
  }

  async function send(message: string): Promise<AssistantReply | null> {
    if (isLoadingRef.value) {
      return null
    }

    messagesRef.value.push({
      id: `${Date.now()}-user`,
      role: 'user',
      content: message,
      timestamp: Date.now(),
    })

    isLoadingRef.value = true

    try {
      const reply = await runtime.send(message)

      messagesRef.value.push({
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: reply.message,
        reply,
        timestamp: Date.now(),
      })

      return reply
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'

      messagesRef.value.push({
        id: `${Date.now()}-error`,
        role: 'assistant',
        content: errorMessage,
        reply: { message: errorMessage, blocks: [{ type: 'error', content: errorMessage }] },
        timestamp: Date.now(),
      })

      return null
    } finally {
      isLoadingRef.value = false
    }
  }

  function registerAction(
    name: string,
    handler: (params: Record<string, unknown>) => Promise<unknown>,
    options: HHActionOptions = {},
  ) {
    runtime.registerAction(name, handler, options)
  }

  async function executeAction(name: string, params: Record<string, unknown> = {}) {
    isLoadingRef.value = true

    try {
      const result = await runtime.execute(name, params)

      if (result.success) {
        messagesRef.value.push({
          id: `${Date.now()}-action`,
          role: 'assistant',
          content: `Action completed: ${name}`,
          reply: {
            message: `Action completed: ${name}`,
            blocks: [{ type: 'status', title: 'Done', content: result.result !== undefined ? String(result.result) : `Action "${name}" executed successfully.` }],
            suggestedActions: [],
          },
          timestamp: Date.now(),
        })
      } else {
        messagesRef.value.push({
          id: `${Date.now()}-action-err`,
          role: 'assistant',
          content: result.error ?? 'Action failed',
          reply: {
            message: result.error ?? 'Action failed',
            blocks: [{ type: 'error', content: result.error ?? 'Action failed' }],
            suggestedActions: [],
          },
          timestamp: Date.now(),
        })
      }

      return result
    } finally {
      isLoadingRef.value = false
    }
  }

  function clearSession() {
    runtime.clearSession()
    messagesRef.value = []
  }

  return {
    isOpen: readonly(isOpenRef),
    isLoading: readonly(isLoadingRef),
    messages: readonly(messagesRef),
    open,
    close,
    toggle,
    send,
    registerAction,
    executeAction,
    clearSession,
  }
}
