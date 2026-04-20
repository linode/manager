import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // Timeout configurations for CI stability
      testTimeout: 30000, // 30 seconds per test
      hookTimeout: 30000, // 30 seconds for hooks
      teardownTimeout: 30000, // 30 seconds for teardown
      // Cap in-test concurrency on CI to reduce jsdom / MSW flakes on busy agents
      maxConcurrency: process.env.CI ? 5 : undefined,
      // Additional test-specific config
      include: ['**/*.test.{js,jsx,ts,tsx}'],
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/testSetup.ts',
      coverage: {
        exclude: [
          'src/**/*.constants.{js,jsx,ts,tsx}',
          'src/**/*.stories.{js,jsx,ts,tsx}',
          'src/**/index.{js,jsx,ts,tsx}',
          'src/**/*.styles.{js,jsx,ts,tsx}',
        ],
        include: [
          'src/components/**/*.{js,jsx,ts,tsx}',
          'src/hooks/*{js,jsx,ts,tsx}',
          'src/utilities/**/*.{js,jsx,ts,tsx}',
          'src/**/*.utils.{js,jsx,ts,tsx}',
        ],
      },
    },
  })
);
