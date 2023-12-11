import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

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
    setupFiles: './src/testSetup.ts',
  },
});
