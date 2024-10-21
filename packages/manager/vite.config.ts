import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';
import type { UserConfig } from 'vitest/config';
import { URL } from 'url';

// ESM-friendly alternative to `__dirname`.
const DIRNAME = new URL('.', import.meta.url).pathname;

export default defineConfig({
  build: {
    outDir: 'build',
  },
  envPrefix: 'REACT_APP_',
  // @todo Remove this `as` when we upgrade our package manager. Yarn v1's hoisting behavior is causing a type error
  plugins: [react(), svgr({ exportAsDefault: true })] as UserConfig['plugins'],
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
    pool: 'forks',
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/testSetup.ts',
  },
});
