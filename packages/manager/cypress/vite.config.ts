import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@src': `${__dirname}/../src`,
      src: `${__dirname}/../src`,
      support: `${__dirname}/../cypress/support`,
    },
  },
});
