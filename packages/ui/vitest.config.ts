import { defineConfig } from 'vitest/config';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [svgr({ exportAsDefault: true })],
  test: {
    environment: 'jsdom',
    setupFiles: './testSetup.ts',
  },
});
