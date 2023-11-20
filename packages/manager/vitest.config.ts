import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      coverage: {
        exclude: [
          'src/**/*.constants.{js,jsx,ts,tsx}',
          'src/**/*.hooks.{js,jsx,ts,tsx}',
          'src/**/*.stories.{js,jsx,ts,tsx}',
          'src/**/index.{js,jsx,ts,tsx}',
          'src/**/*.styles.{js,jsx,ts,tsx}',
        ],
        include: [
          'src/components/**/*.{js,jsx,ts,tsx}',
          'src/utilities/**/*.{js,jsx,ts,tsx}',
          'src/**/*.utils.{js,jsx,ts,tsx}',
        ],
      },
      server: {
        deps: {
          inline: ['@linode/api-v4'],
        },
      },
    },
  })
);
