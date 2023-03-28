import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  build: {
    outDir: 'build',
  },
  plugins: [react(), svgr({ exportAsDefault: true })],
  envPrefix: 'REACT_APP_',
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      src: `${__dirname}/src`,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/testSetup.ts',
  },
});
