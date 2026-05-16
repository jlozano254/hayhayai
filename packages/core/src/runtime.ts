import type { HayHayConfig, AssistantReply, HHActionOptions, SemanticTree } from './types/index.js'
import { scan } from './scanner/index.js'
import { serialize } from './serializer/index.js'
import { ActionRegistry } from './registry/index.js'
import { Transport } from './transport/index.js'
import { Session } from './session/index.js'
import { validateReply } from './response-validator/index.js'

export class HayHayRuntime {
  readonly registry: ActionRegistry
  readonly session: Session
  private transport: Transport
  private config: HayHayConfig

  constructor(config: HayHayConfig) {
    this.config = config
    this.registry = new ActionRegistry()
    this.session = new Session()
    this.transport = new Transport(config)
  }

  registerAction(
    name: string,
    handler: (params: Record<string, unknown>) => Promise<unknown>,
    options: HHActionOptions = {},
  ): void {
    this.registry.register(name, handler, options)

    if (this.config.debug) {
      console.debug(`[hayhayai] action registered: ${name}`, options)
    }
  }

  /** Scan the current DOM and return a semantic tree */
  scanPage(root?: Element): SemanticTree {
    const nodes = scan(root ?? document)
    return serialize(nodes)
  }

  /** Send a user message to the backend and return the assistant reply */
  async send(message: string): Promise<AssistantReply> {
    this.session.add('user', message)

    const pageContext = this.scanPage()
    const conversation = this.session.conversationPairs()

    if (this.config.debug) {
      console.debug('[hayhayai] sending message', { message, pageContext, conversation })
    }

    const rawReply = await this.transport.send({ message, pageContext, conversation })
    const reply = validateReply(rawReply)

    this.session.add('assistant', reply.message)

    return reply
  }

  /** Execute a registered action by name */
  async execute(
    name: string,
    params: Record<string, unknown> = {},
  ): Promise<{ success: boolean; result?: unknown; error?: string }> {
    const action = this.registry.get(name)

    if (!action) {
      return { success: false, error: `Action "${name}" is not registered.` }
    }

    if (this.config.debug) {
      console.debug(`[hayhayai] executing action: ${name}`, params)
    }

    return this.registry.execute(name, params)
  }

  clearSession(): void {
    this.session.clear()
  }
}

export function createRuntime(config: HayHayConfig): HayHayRuntime {
  return new HayHayRuntime(config)
}
