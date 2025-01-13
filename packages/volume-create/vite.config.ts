import react from "@vitejs/plugin-react-swc";
// import federation from "@originjs/vite-plugin-federation";
import { federation } from "@module-federation/vite";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vite";
import { URL } from "url";

// ESM-friendly alternative to `__dirname`.
const DIRNAME = new URL(".", import.meta.url).pathname;

export default defineConfig({
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  envPrefix: "REACT_APP_",
  resolve: {
    alias: {
      src: `${DIRNAME}/src`,
    },
  },
  plugins: [
      react(),
      svgr({ exportAsDefault: true }),
      federation({
        name: "volume-create",
        filename: "remoteEntry.js",
        exposes: {
          './VolumeCreate': './src/index.tsx',
          './Hello': './src/hello.tsx'
        },
        shared: [
          'axios',
          'react',
          'react-dom',
          '@tanstack/react-query',
          '@mui/material',
          '@emotion/react'
        ],
      })
  ],
  server: {
    port: 3001,
  },
});
