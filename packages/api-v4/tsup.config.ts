import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    splitting: false,
    format: ['esm', 'cjs', 'iife'],
    target: 'es6',
    dts: true,
    outDir: 'lib/bundles',
  },
  {
    entry: ['src/*.ts', 'src/**/*.ts'],
    format: ['esm', 'cjs', 'iife'],
    target: 'es6',
    dts: true,
    splitting: false,
    outDir: 'lib',
  },
]);
