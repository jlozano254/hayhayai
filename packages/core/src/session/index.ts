import type { HHMessage } from '../types/index.js'

export class Session {
  private messages: HHMessage[] = []

  add(role: HHMessage['role'], content: string): HHMessage {
    const message: HHMessage = { role, content, timestamp: Date.now() }
    this.messages.push(message)
    return message
  }

  history(): HHMessage[] {
    return [...this.messages]
  }

  conversationPairs(): Array<{ role: 'user' | 'assistant'; content: string }> {
    return this.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
  }

  clear(): void {
    this.messages = []
  }

  get length(): number {
    return this.messages.length
  }
}
