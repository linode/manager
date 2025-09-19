import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import { federation } from '@module-federation/vite';

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
          singleton: true,
        },
        '@linode/api-v4/': {
          singleton: true,
        },
      },
    }),
    react()
  ],
})
