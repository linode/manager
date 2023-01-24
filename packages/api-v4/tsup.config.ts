import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'iife'],
  target: 'es6',
  outDir: 'lib',
  splitting: false,
  dts: false,
});
