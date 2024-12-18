import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'build',
  },
  plugins: [react(), svgr({ exportAsDefault: true })],
  server: {
    port: 3001,
  },
});
