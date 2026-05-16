import type { HayHayRuntime } from '@jlozano254/hayhayai-core'

/**
 * Re-scans the DOM after each Inertia page navigation if @inertiajs/vue3 is present.
 * Must be called once during app setup (e.g., in app.js after mounting).
 */
export function useInertiaRescan(runtime: HayHayRuntime): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { router } = require('@inertiajs/vue3') as { router: { on: (event: string, cb: () => void) => void } }
    router.on('navigate', () => {
      if (runtime) {
        runtime.scanPage()
      }
    })
  } catch {
    // @inertiajs/vue3 not installed — skip silently
  }
}
