import { describe, it, expect } from 'vitest'
import { Session } from '../session/index.js'

describe('Session', () => {
  it('adds messages and returns history', () => {
    const session = new Session()
    session.add('user', 'Hello')
    session.add('assistant', 'Hi there')

    expect(session.length).toBe(2)
    expect(session.history()[0]!.role).toBe('user')
    expect(session.history()[1]!.content).toBe('Hi there')
  })

  it('conversationPairs excludes system messages', () => {
    const session = new Session()
    session.add('system', 'You are a helpful assistant')
    session.add('user', 'Hello')
    session.add('assistant', 'Hi')

    const pairs = session.conversationPairs()
    expect(pairs).toHaveLength(2)
    expect(pairs.every((p) => p.role !== 'system')).toBe(true)
  })

  it('clear() empties the history', () => {
    const session = new Session()
    session.add('user', 'test')
    session.clear()

    expect(session.length).toBe(0)
  })
})
