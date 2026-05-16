import type { HHAction, HHActionOptions } from '../types/index.js'

export class ActionRegistry {
  private actions = new Map<string, HHAction>()

  register(
    name: string,
    handler: (params: Record<string, unknown>) => Promise<unknown>,
    options: HHActionOptions = {},
  ): void {
    this.actions.set(name, {
      name,
      handler,
      options: {
        risk: options.risk ?? 'low',
        confirm: options.confirm ?? false,
        description: options.description,
      },
    })
  }

  has(name: string): boolean {
    return this.actions.has(name)
  }

  get(name: string): HHAction | undefined {
    return this.actions.get(name)
  }

  list(): HHAction[] {
    return Array.from(this.actions.values())
  }

  async execute(
    name: string,
    params: Record<string, unknown> = {},
  ): Promise<{ success: boolean; result?: unknown; error?: string }> {
    const action = this.actions.get(name)

    if (!action) {
      return { success: false, error: `Action "${name}" is not registered.` }
    }

    try {
      const result = await action.handler(params)
      return { success: true, result }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return { success: false, error: message }
    }
  }

  clear(): void {
    this.actions.clear()
  }
}
