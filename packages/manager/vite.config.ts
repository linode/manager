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
  plugins: [react(), svgr({ exportAsDefault: true }), urlCanParsePolyfill()],
  resolve: {
    alias: {
      src: `${DIRNAME}/src`,
      '@linode/api-v4*': `${DIRNAME}/../api-v4/src/index.ts`,
      '@linode/validation*': `${DIRNAME}/../validation/src/index.ts`,
    },
  },
  server: {
    allowedHosts: ['cloud.lindev.local'],
    port: 3000,
  },
  test: {
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
    environment: 'jsdom',
    globals: true,
    pool: 'forks',
    setupFiles: './src/testSetup.ts',
  },
});
