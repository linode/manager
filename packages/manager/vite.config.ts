import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react-swc';
import { URL } from 'url';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

import { urlCanParsePolyfill } from './src/polyfills/urlCanParse';

// ESM-friendly alternative to `__dirname`.
const DIRNAME = new URL('.', import.meta.url).pathname;

export default defineConfig((env) => ({
  build: {
    outDir: 'build',
    target: 'ES2022',
  },
  envPrefix: 'REACT_APP_',
  plugins: [
    federation({
      name: 'host',
      remotes: {
        betas: {
          type: 'module',
          name: 'betas',
          entry: 'https://betas.nussman.us/remoteEntry.js',
          // entry: 'http://localhost:4000/remoteEntry.js',
        },
      },
      filename: 'remoteEntry.js',
      shared: {
        react: {
          singleton: true,
        },
        '@linode/api-v4/': {
          singleton: true,
        },
      },
    }),
    react(),
    svgr({ exportAsDefault: true }),
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
}));
