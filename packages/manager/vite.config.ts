import {
  computeUiPortalProxy,
  externalComputeUiPortalScript,
  injectPortalConfig,
} from '@akamai/compute-ui-portal/vite';
import react from '@vitejs/plugin-react';
import { URL } from 'url';
import svgr from 'vite-plugin-svgr';
import { defineConfig, type Plugin } from 'vitest/config';

import { urlCanParsePolyfill } from './src/polyfills/urlCanParse';

// ESM-friendly alternative to `__dirname`.
const DIRNAME = new URL('.', import.meta.url).pathname;

// Re-scopes @akamai/cds-tokens dark theme from :root{} to [data-theme="dark"]{}
// so it only activates when LinodeThemeWrapper sets data-theme="dark" on <body>.
const cdsDarkTokensScope = (): Plugin => ({
  name: 'cds-dark-tokens-scope',
  transform(code, id) {
    if (id.includes('@akamai/cds-tokens') && id.includes('themes/dark')) {
      return code.replace(':root {', '[data-theme="dark"] {');
    }
  },
});

export default defineConfig({
  build: {
    outDir: 'build',
    rollupOptions: {
      external: [/^\/libs\/compute-ui-portal\//],
    },
  },
  envPrefix: 'COMPUTE_',
  plugins: [
    cdsDarkTokensScope(),
    react(),
    svgr({ svgrOptions: { exportType: 'default' }, include: '**/*.svg' }),
    urlCanParsePolyfill(),
    computeUiPortalProxy(),
    externalComputeUiPortalScript(),
    injectPortalConfig(),
  ],
  resolve: {
    alias: {
      src: `${DIRNAME}/src`,
      // @akamai/cds-components only exports "./theme" (font-family.css + reboot.css).
      // We need the @font-face rules alone so Nunito Sans matches CDS components without
      // Bootstrap reboot resets conflicting with MUI CssBaseline and index.css.
      '@akamai/cds-components/font-family': `${DIRNAME}/node_modules/@akamai/cds-components/dist/theme/theme/font-family.css`,
      // In test mode, stub out msw/browser so Vite never tries to resolve the
      // real subpath export. `vitest related` scans the full source tree and
      // hits mswWorkers.ts → msw/browser, which fails under Node conditions in
      // Vite 7 + Node 22. The browser worker is never used in unit tests.
      ...(process.env.VITEST
        ? { 'msw/browser': `${DIRNAME}/src/mocks/mswBrowserStub.ts` }
        : {}),
    },
  },
  server: {
    allowedHosts: ['cloud.lindev.local'],
    port: 3000,
  },
  test: {
    env: {
      COMPUTE_CLIENT_ID: 'test-client-id',
    },
    // Limit parallelism in CI to prevent resource exhaustion on shared agents.
    maxWorkers: process.env.CI ? '50%' : undefined,
    // Generous timeouts: MSW + async React state updates need room to breathe.
    // 5 s (Vitest default) is too tight for integration-style component tests.
    // A test exceeding 30 s is almost certainly broken, not just slow.
    testTimeout: 30000,
    hookTimeout: 30000,
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
