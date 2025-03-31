import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [svgr({ exportAsDefault: true })],

  test: {
    environment: 'jsdom',
    setupFiles: './testSetup.ts',
  },
});
