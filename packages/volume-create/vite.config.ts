import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vite";
import { URL } from "url";

// ESM-friendly alternative to `__dirname`.
const DIRNAME = new URL(".", import.meta.url).pathname;

export default defineConfig({
  build: {
    outDir: "build",
  },
  envPrefix: "REACT_APP_",
  resolve: {
    alias: {
      src: `${DIRNAME}/src`,
    },
  },
  plugins: [react(), svgr({ exportAsDefault: true })],
  server: {
    port: 3001,
  },
});
