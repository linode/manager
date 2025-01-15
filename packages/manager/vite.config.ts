// import federation from '@originjs/vite-plugin-federation';
import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react-swc';
import { URL } from 'url';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

// ESM-friendly alternative to `__dirname`.
const DIRNAME = new URL('.', import.meta.url).pathname;

export default defineConfig({
  build: {
    outDir: 'build',
  },
  envPrefix: 'REACT_APP_',
  plugins: [
    react(),
    svgr({ exportAsDefault: true }),
    federation({
      name: '~manager',
      // remotes: {
      //   volume_create: 'http://localhost:3001/assets/remoteEntry.js',
      // },
      remotes: {
        // For @module-federation/vite
        volume_create: {
          entry: 'http://localhost:3001/remoteEntry.js',
          entryGlobalName: 'volume_create',
          name: 'volume_create',
          shareScope: 'default',
          type: 'module',
        },
      },
      shared: [
        'axios',
        'react',
        'react-dom',
        '@tanstack/react-query',
        '@mui/material',
        '@emotion/react',
        '@linode/api-v4',
        'react-router-dom',
        '@tanstack/react-router',
      ],
    }),
  ],
  resolve: {
    alias: {
      src: `${DIRNAME}/src`,
    },
  },
  server: {
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
