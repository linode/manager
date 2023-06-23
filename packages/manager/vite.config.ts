import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  build: {
    outDir: 'build',
  },
  envPrefix: 'REACT_APP_',
  plugins: [react(), svgr({ exportAsDefault: true })],
  resolve: {
    alias: {
      src: `${__dirname}/src`,
    },
  },
  server: {
    port: 3000,
  },
});
