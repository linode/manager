import react from '@vitejs/plugin-react-swc';
import { URL } from 'url';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

import { urlCanParsePolyfill } from './src/polyfills/urlCanParse';

// ESM-friendly alternative to `__dirname`.
const DIRNAME = new URL('.', import.meta.url).pathname;

export default defineConfig({
  build: {
    outDir: 'build',
  },
  envPrefix: 'REACT_APP_',
  plugins: [
    react(),
    svgr({ svgrOptions: { exportType: 'default' }, include: '**/*.svg' }),
    urlCanParsePolyfill(),
  ],
  resolve: {
    alias: {
      src: `${DIRNAME}/src`,
    },
  },
  server: {
    allowedHosts: ['cloud.lindev.local'],
    port: 3000,
  },
  test: {
    // Limit test concurrency in CI to prevent resource exhaustion
    maxWorkers: process.env.CI ? '50%' : undefined,
    // Additional test-specific config
    include: ['**/*.test.{js,jsx,ts,tsx}'],
    sequence: {
      groupOrder: 1,
    },
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/testSetup.ts',
    coverage: {
      exclude: [
        'src/**/*.constants.{js,jsx,ts,tsx}',
        'src/**/*.stories.{js,jsx,ts,tsx}',
        'src/**/index.{js,jsx,ts,tsx}',
        'src/**/*.styles.{js,jsx,ts,tsx}',
      ],
      include: [
        'src/components/**/*.{js,jsx,ts,tsx}',
        'src/hooks/*{js,jsx,ts,tsx}',
        'src/utilities/**/*.{js,jsx,ts,tsx}',
        'src/**/*.utils.{js,jsx,ts,tsx}',
      ],
    },
  },
});
