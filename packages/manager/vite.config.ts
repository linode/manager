import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import reactSvgPlugin from "vite-plugin-react-svg";
import alias from "@rollup/plugin-alias";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    reactSvgPlugin({
      svgoConfig: {
        removeViewBox: false,
      },
    }),
  ],
  define: { "process.env": JSON.stringify("import.meta.env") },
  resolve: {
    alias: {
      // '@linode/api-v4': '../api-v4',
      // '@linode/validation': '../validation',
      src: path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        alias({
          entries: [
            { find: "@linode/api-v4", replacement: "../api-v4" },
            { find: "@linode/validation", replacement: "../validation" },
          ],
        }),
      ],
    },
  },
  envPrefix: "REACT_APP_",
});
