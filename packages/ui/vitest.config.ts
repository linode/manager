import { defineConfig, UserConfig } from 'vitest/config';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [svgr({ exportAsDefault: true })] as UserConfig['plugins'],
  test: {
    environment: 'jsdom',
    setupFiles: './testSetup.ts',
  },
});
