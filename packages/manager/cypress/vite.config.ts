import react from '@vitejs/plugin-react-swc';
import { URL } from 'url';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// ESM-friendly alternative to `__dirname`.
const DIRNAME = new URL('.', import.meta.url).pathname;

export default defineConfig({
  plugins: [react(), svgr({ exportAsDefault: true })],
  build: {
    rollupOptions: {
      // Suppress "SOURCEMAP_ERROR" warnings.
      // This is necessary because MUI contains React SSR "use client" module-level
      // directive, and Rollup does not support module-level directives.
      // `vite-plugin-react` and `vite-plugin-react-swc` both silence this warning,
      // but the inability to handle module-level directives also causes Sourcemap
      // output errors. The warnings for this are not suppressed by Vite plugins,
      // so we need to suppress them ourselves.
      //
      // See also:
      // - https://github.com/vitejs/vite-plugin-react/blob/7f53c63/packages/plugin-react/src/index.ts#L303
      // - https://github.com/vitejs/vite-plugin-react-swc/blob/53ecc44/src/index.ts#L262
      // - https://github.com/rollup/rollup/issues/4699#issuecomment-1299770973
      // - https://github.com/vitejs/vite/issues/15012#issuecomment-1815854072
      onwarn(warning, defaultHandler) {
        if (warning.code === 'SOURCEMAP_ERROR') {
          return;
        }
        defaultHandler(warning);
      },
    },
  },
  resolve: {
    alias: {
      '@src': `${DIRNAME}/../src`,
      src: `${DIRNAME}/../src`,
      support: `${DIRNAME}/../cypress/support`,
    },
  },
});
