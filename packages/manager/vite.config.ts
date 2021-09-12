import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import path from 'path'
import reactSvgPlugin from 'vite-plugin-react-svg';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(),
    reactSvgPlugin(),
  ],
  define: { 'process.env': process.env },
  resolve: {
    alias: {
      'src': path.resolve(__dirname, './src'),
      '@linode/validation': path.resolve(__dirname, '../validation/'),
      '@linode/api-v4': path.resolve(__dirname, '../api-v4/'),
    },
  },
})