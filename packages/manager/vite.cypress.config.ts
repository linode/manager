import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@src/': `${__dirname}/src/`,
      'support/': `${__dirname}/cypress/support/`,
      'src/': `${__dirname}/src/`,
    },
  },
});
