import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    svgr({ svgrOptions: { exportType: 'default' }, include: '**/*.svg' }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './testSetup.ts',
  },
});
