import type { HHNode, SemanticTree } from '../types/index.js'

/**
 * Serialize an array of HHNodes into a SemanticTree with page context.
 */
export function serialize(nodes: HHNode[], page?: { url: string; title: string }): SemanticTree {
  return {
    page: page ?? {
      url: typeof window !== 'undefined' ? window.location.href : '',
      title: typeof document !== 'undefined' ? document.title : '',
    },
    components: nodes,
  }
}
