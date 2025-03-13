import react from '@vitejs/plugin-react-swc';
import { URL } from 'url';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

// ESM-friendly alternative to `__dirname`.
const DIRNAME = new URL('.', import.meta.url).pathname;

export default defineConfig({
  build: {
    outDir: 'build',
    rollupOptions: {
      // Optional dependencies that are not needed for the build.
      // See https://www.npmjs.com/package/jspdf
      external: ['canvg', 'html2canvas', 'dompurify'],
    },
  },
  envPrefix: 'REACT_APP_',
  plugins: [react(), svgr({ exportAsDefault: true })],
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
});
