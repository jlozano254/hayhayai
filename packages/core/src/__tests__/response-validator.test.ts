import { describe, it, expect } from 'vitest'
import { validateReply } from '../response-validator/index.js'

describe('validateReply', () => {
  it('validates a minimal valid reply', () => {
    const reply = validateReply({ message: 'Hello!' })
    expect(reply.message).toBe('Hello!')
    expect(reply.blocks).toEqual([])
    expect(reply.suggestedActions).toEqual([])
  })

  it('validates a full reply with blocks and actions', () => {
    const reply = validateReply({
      message: 'Found 2 items',
      blocks: [{ type: 'list', title: 'Items', items: ['a', 'b'] }],
      suggestedActions: [{ label: 'Add all', action: { name: 'bulk-add', targets: ['a'] } }],
    })

    expect(reply.blocks).toHaveLength(1)
    expect(reply.suggestedActions).toHaveLength(1)
  })

  it('throws on missing message', () => {
    expect(() => validateReply({ blocks: [] })).toThrow()
  })

  it('throws on unknown block type', () => {
    expect(() => validateReply({ message: 'ok', blocks: [{ type: 'alien-block' }] })).toThrow()
  })

  it('throws on non-array blocks', () => {
    expect(() => validateReply({ message: 'ok', blocks: 'not-an-array' })).toThrow()
  })
})
