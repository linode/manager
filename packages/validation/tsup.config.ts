import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    target: 'es6',
    outDir: 'lib',
    legacyOutput: true,
    splitting: false,
    dts: true,
  },
]);
