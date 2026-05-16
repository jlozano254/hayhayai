import type { TransportRequest, TransportResponse, AssistantReply, HayHayConfig } from '../types/index.js'

const defaultMockReply: AssistantReply = {
  message: "I'm here to help! I can see the page content and assist you with available actions.",
  blocks: [
    {
      type: 'status',
      title: 'Connected',
      content: 'hayhayai mock transport is active. Wire up a real backend to get AI responses.',
    },
  ],
  suggestedActions: [],
}

export class Transport {
  private config: HayHayConfig

  constructor(config: HayHayConfig) {
    this.config = config
  }

  async send(request: TransportRequest): Promise<AssistantReply> {
    if (this.config.mock) {
      if (typeof this.config.mock === 'function') {
        return this.config.mock()
      }

      return defaultMockReply
    }

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...this.config.headers,
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`hayhayai transport error: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as TransportResponse
    return data.reply
  }
}
