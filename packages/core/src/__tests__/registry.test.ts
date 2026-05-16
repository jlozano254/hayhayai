import { describe, it, expect } from 'vitest'
import { ActionRegistry } from '../registry/index.js'

describe('ActionRegistry', () => {
  it('registers and executes an action', async () => {
    const registry = new ActionRegistry()
    registry.register('test-action', async () => 'done')

    const result = await registry.execute('test-action')
    expect(result.success).toBe(true)
    expect(result.result).toBe('done')
  })

  it('returns error for unregistered action', async () => {
    const registry = new ActionRegistry()
    const result = await registry.execute('missing')

    expect(result.success).toBe(false)
    expect(result.error).toContain('not registered')
  })

  it('has() returns correct boolean', () => {
    const registry = new ActionRegistry()
    registry.register('exists', async () => null)

    expect(registry.has('exists')).toBe(true)
    expect(registry.has('missing')).toBe(false)
  })

  it('passes params to handler', async () => {
    const registry = new ActionRegistry()
    const received: Record<string, unknown>[] = []

    registry.register('capture', async (params) => {
      received.push(params)
    })

    await registry.execute('capture', { target: 'book-1' })
    expect(received[0]).toEqual({ target: 'book-1' })
  })
})
