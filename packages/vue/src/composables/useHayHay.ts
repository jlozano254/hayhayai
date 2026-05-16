import { inject, ref, readonly, watch, effectScope, type InjectionKey } from 'vue'
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

// ─── localStorage persistence ─────────────────────────────────────────────────

const DEFAULT_STORAGE_KEY = 'hayhayai-messages'
const DEFAULT_MAX_MESSAGES = 60

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function loadFromStorage(key: string): ChatMessage[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as ChatMessage[]) : []
  } catch {
    return []
  }
}

function saveToStorage(key: string, messages: ChatMessage[], max: number): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(key, JSON.stringify(messages.slice(-max)))
  } catch {}
}

// ─── Module-level shared state ────────────────────────────────────────────────

const isOpenRef = ref(false)
const isLoadingRef = ref(false)
const messagesRef = ref<ChatMessage[]>(loadFromStorage(DEFAULT_STORAGE_KEY))

let _persistenceActive = false
let _activeStorageKey = DEFAULT_STORAGE_KEY

/**
 * Activate localStorage persistence. Called once by the plugin install.
 * Uses a detached effectScope so the watcher is never stopped by component unmount.
 */
export function activatePersistence(config: HayHayConfig): void {
  if (_persistenceActive) return

  const persistOpt = config.persist ?? true
  if (!persistOpt) return

  const key = typeof persistOpt === 'object' ? (persistOpt.key ?? DEFAULT_STORAGE_KEY) : DEFAULT_STORAGE_KEY
  const max =
    typeof persistOpt === 'object' ? (persistOpt.maxMessages ?? DEFAULT_MAX_MESSAGES) : DEFAULT_MAX_MESSAGES

  if (key !== DEFAULT_STORAGE_KEY) {
    messagesRef.value = loadFromStorage(key)
  }

  _activeStorageKey = key

  const scope = effectScope(true)
  scope.run(() => {
    watch(messagesRef, (msgs) => saveToStorage(key, msgs, max), { deep: true })
  })

  _persistenceActive = true
}

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
        // If the action returned custom blocks, render them directly
        const actionData = result.result as Record<string, unknown> | null
        const hhBlocks = actionData && typeof actionData === 'object' && Array.isArray(actionData.hhBlocks)
          ? actionData.hhBlocks
          : null

        if (hhBlocks && hhBlocks.length > 0) {
          messagesRef.value.push({
            id: `${Date.now()}-action`,
            role: 'assistant',
            content: '',
            reply: {
              message: '',
              blocks: hhBlocks,
              suggestedActions: [],
            },
            timestamp: Date.now(),
          })
        } else if (!actionData?.silent) {
          messagesRef.value.push({
            id: `${Date.now()}-action`,
            role: 'assistant',
            content: `Action completed: ${name}`,
            reply: {
              message: `Action completed: ${name}`,
              blocks: [{ type: 'status', title: 'Done', content: result.result !== undefined && !hhBlocks ? String(result.result) : `Action "${name}" executed successfully.` }],
              suggestedActions: [],
            },
            timestamp: Date.now(),
          })
        }
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
    if (isBrowser()) {
      try {
        localStorage.removeItem(_activeStorageKey)
      } catch {}
    }
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
