import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJs from 'vite-plugin-css-injected-by-js'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), cssInjectedByJs()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'HayHayVue',
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', '@jlozano254/hayhayai-core', '@inertiajs/vue3'],
      output: {
        globals: {
          vue: 'Vue',
          '@jlozano254/hayhayai-core': 'HayHayCore',
        },
      },
    },
    sourcemap: true,
  },
})
