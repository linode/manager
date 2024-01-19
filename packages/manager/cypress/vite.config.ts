import { defineConfig } from 'vite';
import { URL } from 'url';

// ESM-friendly alternative to `__dirname`.
const DIRNAME = new URL('.', import.meta.url).pathname;

export default defineConfig({
  resolve: {
    alias: {
      '@src': `${DIRNAME}/../src`,
      src: `${DIRNAME}/../src`,
      support: `${DIRNAME}/../cypress/support`,
    },
  },
});
