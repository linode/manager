import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**'],
  outDir: 'lib',
  tsconfig: 'tsconfig.json',
  // splitting: true,
});
