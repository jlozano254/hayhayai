import type { AssistantReply, ChatBlock, SuggestedAction } from '../types/index.js'

const VALID_BLOCK_TYPES = new Set([
  'text',
  'status',
  'list',
  'parsed-list',
  'cart-preview',
  'recommendation',
  'missing-item',
  'confirmation',
  'error',
])

export function validateReply(data: unknown): AssistantReply {
  if (typeof data !== 'object' || data === null) {
    throw new Error('hayhayai: assistant reply must be an object')
  }

  const obj = data as Record<string, unknown>

  if (typeof obj['message'] !== 'string') {
    throw new Error('hayhayai: assistant reply must have a string "message" field')
  }

  if (obj['blocks'] !== undefined) {
    if (!Array.isArray(obj['blocks'])) {
      throw new Error('hayhayai: "blocks" must be an array')
    }

    for (const block of obj['blocks'] as unknown[]) {
      if (typeof block !== 'object' || block === null) {
        throw new Error('hayhayai: each block must be an object')
      }

      const b = block as Record<string, unknown>

      if (typeof b['type'] !== 'string' || !VALID_BLOCK_TYPES.has(b['type'])) {
        throw new Error(`hayhayai: unknown block type "${b['type']}"`)
      }
    }
  }

  if (obj['suggestedActions'] !== undefined && !Array.isArray(obj['suggestedActions'])) {
    throw new Error('hayhayai: "suggestedActions" must be an array')
  }

  return {
    message: obj['message'] as string,
    blocks: (obj['blocks'] as ChatBlock[] | undefined) ?? [],
    suggestedActions: (obj['suggestedActions'] as SuggestedAction[] | undefined) ?? [],
  }
}
