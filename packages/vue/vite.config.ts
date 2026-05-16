import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'HayHayVue',
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', '@hayhayai/core', '@inertiajs/vue3'],
      output: {
        globals: {
          vue: 'Vue',
          '@hayhayai/core': 'HayHayCore',
        },
      },
    },
    sourcemap: true,
  },
})
