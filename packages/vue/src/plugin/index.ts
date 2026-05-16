import type { App } from 'vue'
import { createRuntime, type HayHayConfig } from '@jlozano254/hayhayai-core'
import { hayHayRuntimeKey, hayHayConfigKey, activatePersistence } from '../composables/useHayHay.js'

export function createHayHayPlugin(config: HayHayConfig) {
  return {
    install(app: App) {
      const runtime = createRuntime(config)
      app.provide(hayHayRuntimeKey, runtime)
      app.provide(hayHayConfigKey, config)
      activatePersistence(config)
    },
  }
}
