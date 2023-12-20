// vite.config.ts
import react from "file:///Users/coliu/manager/node_modules/@vitejs/plugin-react-swc/index.mjs";
import svgr from "file:///Users/coliu/manager/node_modules/vite-plugin-svgr/dist/index.js";
import { defineConfig } from "file:///Users/coliu/manager/node_modules/vitest/dist/config.js";
var __vite_injected_original_dirname = "/Users/coliu/manager/packages/manager";
var vite_config_default = defineConfig({
  build: {
    outDir: "build"
  },
  envPrefix: "REACT_APP_",
  plugins: [react(), svgr({ exportAsDefault: true })],
  resolve: {
    alias: {
      src: `${__vite_injected_original_dirname}/src`
    }
  },
  server: {
    port: 3e3
  },
  test: {
    coverage: {
      exclude: [
        "src/**/*.constants.{js,jsx,ts,tsx}",
        "src/**/*.stories.{js,jsx,ts,tsx}",
        "src/**/index.{js,jsx,ts,tsx}",
        "src/**/*.styles.{js,jsx,ts,tsx}"
      ],
      include: [
        "src/components/**/*.{js,jsx,ts,tsx}",
        "src/hooks/*{js,jsx,ts,tsx}",
        "src/utilities/**/*.{js,jsx,ts,tsx}",
        "src/**/*.utils.{js,jsx,ts,tsx}"
      ]
    },
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/testSetup.ts"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvY29saXUvbWFuYWdlci9wYWNrYWdlcy9tYW5hZ2VyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvY29saXUvbWFuYWdlci9wYWNrYWdlcy9tYW5hZ2VyL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9jb2xpdS9tYW5hZ2VyL3BhY2thZ2VzL21hbmFnZXIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djJztcbmltcG9ydCBzdmdyIGZyb20gJ3ZpdGUtcGx1Z2luLXN2Z3InO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZyc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnYnVpbGQnLFxuICB9LFxuICBlbnZQcmVmaXg6ICdSRUFDVF9BUFBfJyxcbiAgcGx1Z2luczogW3JlYWN0KCksIHN2Z3IoeyBleHBvcnRBc0RlZmF1bHQ6IHRydWUgfSldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIHNyYzogYCR7X19kaXJuYW1lfS9zcmNgLFxuICAgIH0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDAsXG4gIH0sXG4gIHRlc3Q6IHtcbiAgICBjb3ZlcmFnZToge1xuICAgICAgZXhjbHVkZTogW1xuICAgICAgICAnc3JjLyoqLyouY29uc3RhbnRzLntqcyxqc3gsdHMsdHN4fScsXG4gICAgICAgICdzcmMvKiovKi5zdG9yaWVzLntqcyxqc3gsdHMsdHN4fScsXG4gICAgICAgICdzcmMvKiovaW5kZXgue2pzLGpzeCx0cyx0c3h9JyxcbiAgICAgICAgJ3NyYy8qKi8qLnN0eWxlcy57anMsanN4LHRzLHRzeH0nLFxuICAgICAgXSxcbiAgICAgIGluY2x1ZGU6IFtcbiAgICAgICAgJ3NyYy9jb21wb25lbnRzLyoqLyoue2pzLGpzeCx0cyx0c3h9JyxcbiAgICAgICAgJ3NyYy9ob29rcy8qe2pzLGpzeCx0cyx0c3h9JyxcbiAgICAgICAgJ3NyYy91dGlsaXRpZXMvKiovKi57anMsanN4LHRzLHRzeH0nLFxuICAgICAgICAnc3JjLyoqLyoudXRpbHMue2pzLGpzeCx0cyx0c3h9JyxcbiAgICAgIF0sXG4gICAgfSxcbiAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcbiAgICBnbG9iYWxzOiB0cnVlLFxuICAgIHNldHVwRmlsZXM6ICcuL3NyYy90ZXN0U2V0dXAudHMnLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlTLE9BQU8sV0FBVztBQUNuVCxPQUFPLFVBQVU7QUFDakIsU0FBUyxvQkFBb0I7QUFGN0IsSUFBTSxtQ0FBbUM7QUFJekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLFdBQVc7QUFBQSxFQUNYLFNBQVMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxFQUFFLGlCQUFpQixLQUFLLENBQUMsQ0FBQztBQUFBLEVBQ2xELFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssR0FBRyxnQ0FBUztBQUFBLElBQ25CO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLFVBQVU7QUFBQSxNQUNSLFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsWUFBWTtBQUFBLEVBQ2Q7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
