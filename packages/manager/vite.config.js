import { defineConfig } from 'vite';
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
      src: ''.concat(__dirname, '/src'),
    },
  },
});
//# sourceMappingURL=vite.config.js.map
