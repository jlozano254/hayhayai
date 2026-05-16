/** A single annotated DOM node extracted by the scanner */
export interface HHNode {
  type: string
  id: string | null
  role: string | null
  meta: Record<string, string>
  fields: Record<string, string>
  actions: HHAnnotatedAction[]
  inputs: HHAnnotatedInput[]
  children: HHNode[]
}

/** An action annotation found on a DOM element */
export interface HHAnnotatedAction {
  name: string
  target: string | null
  risk: 'low' | 'medium' | 'high'
  confirm: boolean
}

/** An input annotation found on a DOM element */
export interface HHAnnotatedInput {
  name: string
  inputType: string
  value: string
}

/** The full semantic tree sent to the backend */
export interface SemanticTree {
  page: {
    url: string
    title: string
  }
  components: HHNode[]
}

/** Options for registering a runtime action */
export interface HHActionOptions {
  risk?: 'low' | 'medium' | 'high'
  confirm?: boolean
  description?: string
}

/** A registered runtime action handler */
export interface HHAction {
  name: string
  handler: (params: Record<string, unknown>) => Promise<unknown>
  options: HHActionOptions
}

/** In-memory session message */
export interface HHMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

/** A structured block rendered inside the chat panel */
export type ChatBlockType =
  | 'text'
  | 'status'
  | 'list'
  | 'parsed-list'
  | 'cart-preview'
  | 'recommendation'
  | 'missing-item'
  | 'confirmation'
  | 'error'

export interface ChatBlock {
  type: ChatBlockType
  title?: string
  [key: string]: unknown
}

/** A suggested action button rendered in the chat */
export interface SuggestedAction {
  label: string
  action: {
    name: string
    target?: string
    targets?: string[]
    params?: Record<string, unknown>
  }
}

/** The structured reply returned by the backend */
export interface AssistantReply {
  message: string
  blocks?: ChatBlock[]
  suggestedActions?: SuggestedAction[]
}

/** The request sent to the backend */
export interface TransportRequest {
  message: string
  pageContext: SemanticTree
  conversation: Array<{ role: 'user' | 'assistant'; content: string }>
  meta?: Record<string, unknown>
}

/** The raw response envelope from the backend */
export interface TransportResponse {
  reply: AssistantReply
}

/** Configuration for the HayHayRuntime */
export interface HayHayConfig {
  endpoint: string
  debug?: boolean
  headers?: Record<string, string>
  mock?: boolean | (() => Promise<AssistantReply>)
  /** Quick prompt buttons shown in the empty chat state */
  quickPrompts?: Array<{ label: string; text: string; icon?: string }>
}
