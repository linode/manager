import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import { federation } from '@module-federation/vite';
import { dependencies } from './package.json';

export default defineConfig({
  server: {
    port: 4000,
  },
  plugins: [
    federation({
      filename: 'remoteEntry.js',
      name: 'betas',
      exposes: {
        './app': './src/App.tsx',
      },
      shared: {
        react: {
          requiredVersion: dependencies.react,
          singleton: true,
        },
      },
    }),
    react()
  ],
})
