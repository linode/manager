import react from "@vitejs/plugin-react-swc";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
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
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
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
        "./VolumeCreate": "./src/index.tsx",
      },
      shareStrategy: "loaded-first",
      shared: [
        "react",
        "react-dom",
        "@tanstack/react-query",
        "@mui/material",
        "@emotion/react",
        "@linode/api-v4",
        "react-router-dom",
        "@tanstack/react-router",
        "notistack",
      ],
    }),
    cssInjectedByJsPlugin(),
  ],
  server: {
    port: 3001,
  },
});
