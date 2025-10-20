import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    exclude: [],
    setupFiles: ['vitest.setup.ts']
  },
})
