import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import reactSvgPlugin from "vite-plugin-react-svg";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    reactSvgPlugin({
      defaultExport: "component",
      svgoConfig: {
        removeViewBox: false,
      },
    }),
  ],
  define: { "process.env": JSON.stringify("import.meta.env") },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
    },
  },
  envPrefix: "REACT_APP_",
});
