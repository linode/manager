// vite.config.ts
import react from "file:///Users/jaramos/Sites/linode-manager-fork/node_modules/@vitejs/plugin-react-swc/index.mjs";
import svgr from "file:///Users/jaramos/Sites/linode-manager-fork/node_modules/vite-plugin-svgr/dist/index.js";
import { defineConfig } from "file:///Users/jaramos/Sites/linode-manager-fork/node_modules/vitest/dist/config.js";
import { URL } from "url";
var __vite_injected_original_import_meta_url = "file:///Users/jaramos/Sites/linode-manager-fork/packages/manager/vite.config.ts";
var DIRNAME = new URL(".", __vite_injected_original_import_meta_url).pathname;
var vite_config_default = defineConfig({
  build: {
    outDir: "build"
  },
  envPrefix: "REACT_APP_",
  plugins: [react(), svgr({ exportAsDefault: true })],
  resolve: {
    alias: {
      src: `${DIRNAME}/src`
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvamFyYW1vcy9TaXRlcy9saW5vZGUtbWFuYWdlci1mb3JrL3BhY2thZ2VzL21hbmFnZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9qYXJhbW9zL1NpdGVzL2xpbm9kZS1tYW5hZ2VyLWZvcmsvcGFja2FnZXMvbWFuYWdlci92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvamFyYW1vcy9TaXRlcy9saW5vZGUtbWFuYWdlci1mb3JrL3BhY2thZ2VzL21hbmFnZXIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djJztcbmltcG9ydCBzdmdyIGZyb20gJ3ZpdGUtcGx1Z2luLXN2Z3InO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZyc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICd1cmwnO1xuXG4vLyBFU00tZnJpZW5kbHkgYWx0ZXJuYXRpdmUgdG8gYF9fZGlybmFtZWAuXG5jb25zdCBESVJOQU1FID0gbmV3IFVSTCgnLicsIGltcG9ydC5tZXRhLnVybCkucGF0aG5hbWU7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnYnVpbGQnLFxuICB9LFxuICBlbnZQcmVmaXg6ICdSRUFDVF9BUFBfJyxcbiAgcGx1Z2luczogW3JlYWN0KCksIHN2Z3IoeyBleHBvcnRBc0RlZmF1bHQ6IHRydWUgfSldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIHNyYzogYCR7RElSTkFNRX0vc3JjYCxcbiAgICB9LFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICB9LFxuICB0ZXN0OiB7XG4gICAgY292ZXJhZ2U6IHtcbiAgICAgIGV4Y2x1ZGU6IFtcbiAgICAgICAgJ3NyYy8qKi8qLmNvbnN0YW50cy57anMsanN4LHRzLHRzeH0nLFxuICAgICAgICAnc3JjLyoqLyouc3Rvcmllcy57anMsanN4LHRzLHRzeH0nLFxuICAgICAgICAnc3JjLyoqL2luZGV4Lntqcyxqc3gsdHMsdHN4fScsXG4gICAgICAgICdzcmMvKiovKi5zdHlsZXMue2pzLGpzeCx0cyx0c3h9JyxcbiAgICAgIF0sXG4gICAgICBpbmNsdWRlOiBbXG4gICAgICAgICdzcmMvY29tcG9uZW50cy8qKi8qLntqcyxqc3gsdHMsdHN4fScsXG4gICAgICAgICdzcmMvaG9va3MvKntqcyxqc3gsdHMsdHN4fScsXG4gICAgICAgICdzcmMvdXRpbGl0aWVzLyoqLyoue2pzLGpzeCx0cyx0c3h9JyxcbiAgICAgICAgJ3NyYy8qKi8qLnV0aWxzLntqcyxqc3gsdHMsdHN4fScsXG4gICAgICBdLFxuICAgIH0sXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICBzZXR1cEZpbGVzOiAnLi9zcmMvdGVzdFNldHVwLnRzJyxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2VixPQUFPLFdBQVc7QUFDL1csT0FBTyxVQUFVO0FBQ2pCLFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMsV0FBVztBQUhzTSxJQUFNLDJDQUEyQztBQU0zUSxJQUFNLFVBQVUsSUFBSSxJQUFJLEtBQUssd0NBQWUsRUFBRTtBQUU5QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsV0FBVztBQUFBLEVBQ1gsU0FBUyxDQUFDLE1BQU0sR0FBRyxLQUFLLEVBQUUsaUJBQWlCLEtBQUssQ0FBQyxDQUFDO0FBQUEsRUFDbEQsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxHQUFHLE9BQU87QUFBQSxJQUNqQjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxNQUFNO0FBQUEsSUFDSixVQUFVO0FBQUEsTUFDUixTQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULFlBQVk7QUFBQSxFQUNkO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
